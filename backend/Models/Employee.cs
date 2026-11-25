using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagement.Api.Models;

public class Employee
{
    public int EmployeeId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(254)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Column(TypeName = "numeric(18,2)")]
    [Range(0.01, 100000000)]
    public decimal Salary { get; set; }

    public int DepartmentId { get; set; }

    public Department? Department { get; set; }
}
