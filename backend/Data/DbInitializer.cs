using EmployeeManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext dbContext, CancellationToken cancellationToken = default)
    {
        if (await dbContext.Departments.AnyAsync(cancellationToken) ||
            await dbContext.Employees.AnyAsync(cancellationToken))
        {
            return;
        }

        var departments = new List<Department>
        {
            new() { DepartmentName = "Engineering" },
            new() { DepartmentName = "Human Resources" },
            new() { DepartmentName = "Finance" },
            new() { DepartmentName = "Marketing" },
            new() { DepartmentName = "Operations" }
        };

        dbContext.Departments.AddRange(departments);
        await dbContext.SaveChangesAsync(cancellationToken);

        var deptByName = departments.ToDictionary(d => d.DepartmentName, d => d.DepartmentId);

        var employees = new List<Employee>
        {
            new()
            {
                Name = "Aarav Patel",
                Email = "aarav.patel@company.com",
                Salary = 105000m,
                DepartmentId = deptByName["Engineering"]
            },
            new()
            {
                Name = "Maya Lin",
                Email = "maya.lin@company.com",
                Salary = 98000m,
                DepartmentId = deptByName["Engineering"]
            },
            new()
            {
                Name = "Liam O'Connor",
                Email = "liam.oconnor@company.com",
                Salary = 112000m,
                DepartmentId = deptByName["Engineering"]
            },
            new()
            {
                Name = "Sofia Rodriguez",
                Email = "sofia.rodriguez@company.com",
                Salary = 74000m,
                DepartmentId = deptByName["Human Resources"]
            },
            new()
            {
                Name = "Noah Kim",
                Email = "noah.kim@company.com",
                Salary = 88000m,
                DepartmentId = deptByName["Finance"]
            },
            new()
            {
                Name = "Emma Watson",
                Email = "emma.watson@company.com",
                Salary = 82000m,
                DepartmentId = deptByName["Finance"]
            },
            new()
            {
                Name = "Zara Khan",
                Email = "zara.khan@company.com",
                Salary = 76500m,
                DepartmentId = deptByName["Marketing"]
            },
            new()
            {
                Name = "Ethan Brooks",
                Email = "ethan.brooks@company.com",
                Salary = 71000m,
                DepartmentId = deptByName["Operations"]
            }
        };

        dbContext.Employees.AddRange(employees);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
