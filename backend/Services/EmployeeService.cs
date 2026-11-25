using EmployeeManagement.Api.Data;
using EmployeeManagement.Api.DTOs;
using EmployeeManagement.Api.Exceptions;
using EmployeeManagement.Api.Models;
using EmployeeManagement.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Api.Services;

public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _dbContext;

    public EmployeeService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<EmployeeDto>> GetAllAsync(
        string? search,
        int? departmentId,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Employees
            .AsNoTracking()
            .Include(e => e.Department)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(e => e.Name.ToLower().Contains(term));
        }

        if (departmentId.HasValue && departmentId.Value > 0)
        {
            query = query.Where(e => e.DepartmentId == departmentId.Value);
        }

        return await query
            .OrderBy(e => e.EmployeeId)
            .Select(e => new EmployeeDto(
                e.EmployeeId,
                e.Name,
                e.Email,
                e.Salary,
                e.DepartmentId,
                e.Department != null ? e.Department.DepartmentName : string.Empty
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<EmployeeDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var employee = await _dbContext.Employees
            .AsNoTracking()
            .Include(e => e.Department)
            .Where(e => e.EmployeeId == id)
            .Select(e => new EmployeeDto(
                e.EmployeeId,
                e.Name,
                e.Email,
                e.Salary,
                e.DepartmentId,
                e.Department != null ? e.Department.DepartmentName : string.Empty
            ))
            .FirstOrDefaultAsync(cancellationToken);

        return employee ?? throw new NotFoundException($"Employee with ID {id} was not found.");
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto, CancellationToken cancellationToken = default)
    {
        var normalizedName = dto.Name.Trim();
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            throw new BadRequestException("Employee name cannot be blank.");
        }

        var department = await _dbContext.Departments
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DepartmentId == dto.DepartmentId, cancellationToken);

        if (department is null)
        {
            throw new BadRequestException($"Selected department (ID {dto.DepartmentId}) does not exist.");
        }

        var emailInUse = await _dbContext.Employees
            .AnyAsync(e => e.Email.ToLower() == normalizedEmail, cancellationToken);

        if (emailInUse)
        {
            throw new ConflictException($"An employee with email '{normalizedEmail}' already exists.");
        }

        var employee = new Employee
        {
            Name = normalizedName,
            Email = normalizedEmail,
            Salary = dto.Salary,
            DepartmentId = dto.DepartmentId
        };

        _dbContext.Employees.Add(employee);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new EmployeeDto(
            employee.EmployeeId,
            employee.Name,
            employee.Email,
            employee.Salary,
            employee.DepartmentId,
            department.DepartmentName
        );
    }

    public async Task<EmployeeDto> UpdateAsync(int id, UpdateEmployeeDto dto, CancellationToken cancellationToken = default)
    {
        var employee = await _dbContext.Employees
            .FirstOrDefaultAsync(e => e.EmployeeId == id, cancellationToken);

        if (employee is null)
        {
            throw new NotFoundException($"Employee with ID {id} was not found.");
        }

        var normalizedName = dto.Name.Trim();
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            throw new BadRequestException("Employee name cannot be blank.");
        }

        var department = await _dbContext.Departments
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DepartmentId == dto.DepartmentId, cancellationToken);

        if (department is null)
        {
            throw new BadRequestException($"Selected department (ID {dto.DepartmentId}) does not exist.");
        }

        var duplicateEmail = await _dbContext.Employees
            .AnyAsync(e => e.EmployeeId != id && e.Email.ToLower() == normalizedEmail, cancellationToken);

        if (duplicateEmail)
        {
            throw new ConflictException($"Another employee with email '{normalizedEmail}' already exists.");
        }

        employee.Name = normalizedName;
        employee.Email = normalizedEmail;
        employee.Salary = dto.Salary;
        employee.DepartmentId = dto.DepartmentId;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new EmployeeDto(
            employee.EmployeeId,
            employee.Name,
            employee.Email,
            employee.Salary,
            employee.DepartmentId,
            department.DepartmentName
        );
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var employee = await _dbContext.Employees
            .FirstOrDefaultAsync(e => e.EmployeeId == id, cancellationToken);

        if (employee is null)
        {
            throw new NotFoundException($"Employee with ID {id} was not found.");
        }

        _dbContext.Employees.Remove(employee);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
