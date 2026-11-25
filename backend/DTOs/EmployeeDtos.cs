using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Api.DTOs;

public record EmployeeDto(
    int EmployeeId,
    string Name,
    string Email,
    decimal Salary,
    int DepartmentId,
    string DepartmentName
);

public class CreateEmployeeDto
{
    [Required(ErrorMessage = "Employee name is required.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 150 characters.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Please provide a valid email address.")]
    [StringLength(254, ErrorMessage = "Email must not exceed 254 characters.")]
    public string Email { get; set; } = string.Empty;

    [Range(0.01, 100000000, ErrorMessage = "Salary must be greater than 0.")]
    public decimal Salary { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "A valid department must be selected.")]
    public int DepartmentId { get; set; }
}

public class UpdateEmployeeDto
{
    [Required(ErrorMessage = "Employee name is required.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 150 characters.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Please provide a valid email address.")]
    [StringLength(254, ErrorMessage = "Email must not exceed 254 characters.")]
    public string Email { get; set; } = string.Empty;

    [Range(0.01, 100000000, ErrorMessage = "Salary must be greater than 0.")]
    public decimal Salary { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "A valid department must be selected.")]
    public int DepartmentId { get; set; }
}
