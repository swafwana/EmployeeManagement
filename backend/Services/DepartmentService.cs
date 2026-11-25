using EmployeeManagement.Api.Data;
using EmployeeManagement.Api.DTOs;
using EmployeeManagement.Api.Exceptions;
using EmployeeManagement.Api.Models;
using EmployeeManagement.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Api.Services;

public class DepartmentService : IDepartmentService
{
    private readonly AppDbContext _dbContext;

    public DepartmentService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<DepartmentDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Departments
            .AsNoTracking()
            .OrderBy(d => d.DepartmentName)
            .Select(d => new DepartmentDto(
                d.DepartmentId,
                d.DepartmentName,
                d.Employees.Count
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<DepartmentDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var department = await _dbContext.Departments
            .AsNoTracking()
            .Where(d => d.DepartmentId == id)
            .Select(d => new DepartmentDto(
                d.DepartmentId,
                d.DepartmentName,
                d.Employees.Count
            ))
            .FirstOrDefaultAsync(cancellationToken);

        return department ?? throw new NotFoundException($"Department with ID {id} was not found.");
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto, CancellationToken cancellationToken = default)
    {
        var normalizedName = dto.DepartmentName.Trim();
        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            throw new BadRequestException("Department name cannot be blank.");
        }

        var exists = await _dbContext.Departments
            .AnyAsync(d => d.DepartmentName.ToLower() == normalizedName.ToLower(), cancellationToken);

        if (exists)
        {
            throw new ConflictException($"A department named '{normalizedName}' already exists.");
        }

        var department = new Department
        {
            DepartmentName = normalizedName
        };

        _dbContext.Departments.Add(department);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new DepartmentDto(department.DepartmentId, department.DepartmentName, 0);
    }

    public async Task<DepartmentDto> UpdateAsync(int id, UpdateDepartmentDto dto, CancellationToken cancellationToken = default)
    {
        var department = await _dbContext.Departments
            .Include(d => d.Employees)
            .FirstOrDefaultAsync(d => d.DepartmentId == id, cancellationToken);

        if (department is null)
        {
            throw new NotFoundException($"Department with ID {id} was not found.");
        }

        var normalizedName = dto.DepartmentName.Trim();
        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            throw new BadRequestException("Department name cannot be blank.");
        }

        var duplicateExists = await _dbContext.Departments
            .AnyAsync(
                d => d.DepartmentId != id && d.DepartmentName.ToLower() == normalizedName.ToLower(),
                cancellationToken);

        if (duplicateExists)
        {
            throw new ConflictException($"Another department named '{normalizedName}' already exists.");
        }

        department.DepartmentName = normalizedName;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new DepartmentDto(department.DepartmentId, department.DepartmentName, department.Employees.Count);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var department = await _dbContext.Departments
            .Include(d => d.Employees)
            .FirstOrDefaultAsync(d => d.DepartmentId == id, cancellationToken);

        if (department is null)
        {
            throw new NotFoundException($"Department with ID {id} was not found.");
        }

        if (department.Employees.Count > 0)
        {
            throw new ConflictException(
                $"Cannot delete department '{department.DepartmentName}' because it still has {department.Employees.Count} assigned employee(s). Reassign or delete those employees first.");
        }

        _dbContext.Departments.Remove(department);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
