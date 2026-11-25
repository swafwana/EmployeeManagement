using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Api.DTOs;

public record DepartmentDto(
    int DepartmentId,
    string DepartmentName,
    int EmployeeCount
);

public class CreateDepartmentDto
{
    [Required(ErrorMessage = "Department name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Department name must be between 2 and 100 characters.")]
    public string DepartmentName { get; set; } = string.Empty;
}

public class UpdateDepartmentDto
{
    [Required(ErrorMessage = "Department name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Department name must be between 2 and 100 characters.")]
    public string DepartmentName { get; set; } = string.Empty;
}
