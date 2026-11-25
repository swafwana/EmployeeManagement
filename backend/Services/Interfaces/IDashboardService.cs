using EmployeeManagement.Api.DTOs;

namespace EmployeeManagement.Api.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
}
