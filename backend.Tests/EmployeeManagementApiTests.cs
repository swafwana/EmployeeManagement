using System.Net;
using System.Net.Http.Json;
using EmployeeManagement.Api.DTOs;
using Microsoft.Extensions.DependencyInjection;

namespace EmployeeManagement.Tests;

public class EmployeeManagementApiTests
{
    [Fact]
    public async Task DepartmentCrud_AndValidation_ReturnsExpectedStatusCodes()
    {
        await using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClient();

        // Create department -> 201 Created
        var createRes = await client.PostAsJsonAsync("/api/departments", new CreateDepartmentDto
        {
            DepartmentName = "Engineering"
        });
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
        var created = await createRes.Content.ReadFromJsonAsync<DepartmentDto>();
        Assert.NotNull(created);
        Assert.Equal("Engineering", created.DepartmentName);
        Assert.Equal(0, created.EmployeeCount);

        // Duplicate department name -> 409 Conflict
        var dupRes = await client.PostAsJsonAsync("/api/departments", new CreateDepartmentDto
        {
            DepartmentName = "engineering"
        });
        Assert.Equal(HttpStatusCode.Conflict, dupRes.StatusCode);

        // Invalid department name -> 400 BadRequest
        var invalidRes = await client.PostAsJsonAsync("/api/departments", new CreateDepartmentDto
        {
            DepartmentName = "A"
        });
        Assert.Equal(HttpStatusCode.BadRequest, invalidRes.StatusCode);

        // Update department -> 200 OK
        var updateRes = await client.PutAsJsonAsync($"/api/departments/{created.DepartmentId}", new UpdateDepartmentDto
        {
            DepartmentName = "Platform Engineering"
        });
        Assert.Equal(HttpStatusCode.OK, updateRes.StatusCode);
        var updated = await updateRes.Content.ReadFromJsonAsync<DepartmentDto>();
        Assert.Equal("Platform Engineering", updated!.DepartmentName);

        // Delete empty department -> 204 NoContent
        var deleteRes = await client.DeleteAsync($"/api/departments/{created.DepartmentId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteRes.StatusCode);

        // Get deleted department -> 404 NotFound
        var missingRes = await client.GetAsync($"/api/departments/{created.DepartmentId}");
        Assert.Equal(HttpStatusCode.NotFound, missingRes.StatusCode);
    }

    [Fact]
    public async Task EmployeeCrud_SearchFilter_DashboardCounts_AndDeleteConstraint()
    {
        await using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClient();

        // Create two departments
        var engRes = await client.PostAsJsonAsync("/api/departments", new CreateDepartmentDto { DepartmentName = "Engineering" });
        var hrRes = await client.PostAsJsonAsync("/api/departments", new CreateDepartmentDto { DepartmentName = "Human Resources" });
        var eng = (await engRes.Content.ReadFromJsonAsync<DepartmentDto>())!;
        var hr = (await hrRes.Content.ReadFromJsonAsync<DepartmentDto>())!;

        // Create employees -> 201 Created
        var emp1Res = await client.PostAsJsonAsync("/api/employees", new CreateEmployeeDto
        {
            Name = "Alice Johnson",
            Email = "alice@example.com",
            Salary = 95000m,
            DepartmentId = eng.DepartmentId
        });
        Assert.Equal(HttpStatusCode.Created, emp1Res.StatusCode);
        var emp1 = (await emp1Res.Content.ReadFromJsonAsync<EmployeeDto>())!;
        Assert.Equal("Engineering", emp1.DepartmentName);

        var emp2Res = await client.PostAsJsonAsync("/api/employees", new CreateEmployeeDto
        {
            Name = "Bob Martinez",
            Email = "bob@example.com",
            Salary = 75000m,
            DepartmentId = hr.DepartmentId
        });
        Assert.Equal(HttpStatusCode.Created, emp2Res.StatusCode);
        var emp2 = (await emp2Res.Content.ReadFromJsonAsync<EmployeeDto>())!;

        // Duplicate email -> 409 Conflict
        var dupEmailRes = await client.PostAsJsonAsync("/api/employees", new CreateEmployeeDto
        {
            Name = "Another Alice",
            Email = "ALICE@example.com",
            Salary = 60000m,
            DepartmentId = hr.DepartmentId
        });
        Assert.Equal(HttpStatusCode.Conflict, dupEmailRes.StatusCode);

        // Non-existent department -> 400 BadRequest
        var badDeptRes = await client.PostAsJsonAsync("/api/employees", new CreateEmployeeDto
        {
            Name = "Charlie",
            Email = "charlie@example.com",
            Salary = 55000m,
            DepartmentId = 9999
        });
        Assert.Equal(HttpStatusCode.BadRequest, badDeptRes.StatusCode);

        // Invalid DTO (bad email & salary <= 0) -> 400 BadRequest
        var invalidDtoRes = await client.PostAsJsonAsync("/api/employees", new CreateEmployeeDto
        {
            Name = "C",
            Email = "not-an-email",
            Salary = 0m,
            DepartmentId = eng.DepartmentId
        });
        Assert.Equal(HttpStatusCode.BadRequest, invalidDtoRes.StatusCode);

        // Search by employee name
        var searchList = await client.GetFromJsonAsync<List<EmployeeDto>>("/api/employees?search=Alice");
        Assert.NotNull(searchList);
        Assert.Single(searchList);
        Assert.Equal(emp1.EmployeeId, searchList[0].EmployeeId);

        // Filter by department
        var filteredList = await client.GetFromJsonAsync<List<EmployeeDto>>($"/api/employees?departmentId={hr.DepartmentId}");
        Assert.NotNull(filteredList);
        Assert.Single(filteredList);
        Assert.Equal(emp2.EmployeeId, filteredList[0].EmployeeId);

        // Dashboard summary counts
        var summary = await client.GetFromJsonAsync<DashboardSummaryDto>("/api/dashboard");
        Assert.NotNull(summary);
        Assert.Equal(2, summary.TotalEmployees);
        Assert.Equal(2, summary.TotalDepartments);
        Assert.Equal(170000m, summary.TotalPayroll);
        Assert.Equal(85000m, summary.AverageSalary);

        // Deleting a department with active employees -> 409 Conflict
        var deleteBusyDeptRes = await client.DeleteAsync($"/api/departments/{eng.DepartmentId}");
        Assert.Equal(HttpStatusCode.Conflict, deleteBusyDeptRes.StatusCode);

        // Update employee -> move Bob to Engineering
        var updateEmpRes = await client.PutAsJsonAsync($"/api/employees/{emp2.EmployeeId}", new UpdateEmployeeDto
        {
            Name = "Bob Martinez",
            Email = "bob@example.com",
            Salary = 80000m,
            DepartmentId = eng.DepartmentId
        });
        Assert.Equal(HttpStatusCode.OK, updateEmpRes.StatusCode);
        var updatedEmp2 = (await updateEmp2Content(updateEmpRes))!;
        Assert.Equal("Engineering", updatedEmp2.DepartmentName);
        Assert.Equal(80000m, updatedEmp2.Salary);

        // Now HR is empty and can be deleted -> 204 NoContent
        var deleteEmptyHrRes = await client.DeleteAsync($"/api/departments/{hr.DepartmentId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteEmptyHrRes.StatusCode);

        // Delete employee -> 204 NoContent
        var deleteEmpRes = await client.DeleteAsync($"/api/employees/{emp1.EmployeeId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteEmpRes.StatusCode);
    }

    [Fact]
    public async Task CorsHeaders_ArePresent_ForConfiguredFrontendOrigin()
    {
        await using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClient();

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/dashboard");
        request.Headers.Add("Origin", "http://localhost:5173");

        var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("Access-Control-Allow-Origin", out var values));
        Assert.Contains("http://localhost:5173", values);
    }

    [Fact]
    public async Task DbInitializer_SeedsSampleData_OnlyWhenDatabaseIsEmpty()
    {
        await using var factory = new ApiWebApplicationFactory();
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<EmployeeManagement.Api.Data.AppDbContext>();

        await EmployeeManagement.Api.Data.DbInitializer.SeedAsync(db);
        // Calling a second time must be idempotent and not duplicate records
        await EmployeeManagement.Api.Data.DbInitializer.SeedAsync(db);

        using var client = factory.CreateClient();
        var summary = await client.GetFromJsonAsync<DashboardSummaryDto>("/api/dashboard");
        Assert.NotNull(summary);
        Assert.Equal(8, summary.TotalEmployees);
        Assert.Equal(5, summary.TotalDepartments);
    }

    private static Task<EmployeeDto?> updateEmp2Content(HttpResponseMessage res) =>
        res.Content.ReadFromJsonAsync<EmployeeDto>();
}
