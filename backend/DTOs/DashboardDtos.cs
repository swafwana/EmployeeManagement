namespace EmployeeManagement.Api.DTOs;

public record DepartmentSummaryDto(
    int DepartmentId,
    string DepartmentName,
    int EmployeeCount
);

public record DashboardSummaryDto(
    int TotalEmployees,
    int TotalDepartments,
    decimal TotalPayroll,
    decimal AverageSalary,
    IReadOnlyList<DepartmentSummaryDto> Departments
);
