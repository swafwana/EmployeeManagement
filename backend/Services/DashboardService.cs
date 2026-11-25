using EmployeeManagement.Api.Data;
using EmployeeManagement.Api.DTOs;
using EmployeeManagement.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _dbContext;

    public DashboardService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var totalEmployees = await _dbContext.Employees.CountAsync(cancellationToken);
        var totalDepartments = await _dbContext.Departments.CountAsync(cancellationToken);

        var totalPayroll = totalEmployees > 0
            ? await _dbContext.Employees.SumAsync(e => e.Salary, cancellationToken)
            : 0m;

        var averageSalary = totalEmployees > 0
            ? Math.Round(totalPayroll / totalEmployees, 2)
            : 0m;

        var departments = await _dbContext.Departments
            .AsNoTracking()
            .OrderByDescending(d => d.Employees.Count)
            .ThenBy(d => d.DepartmentName)
            .Select(d => new DepartmentSummaryDto(
                d.DepartmentId,
                d.DepartmentName,
                d.Employees.Count
            ))
            .ToListAsync(cancellationToken);

        return new DashboardSummaryDto(
            totalEmployees,
            totalDepartments,
            totalPayroll,
            averageSalary,
            departments
        );
    }
}
