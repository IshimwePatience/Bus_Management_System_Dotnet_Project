using EverGoWebAPI.Models.Dashboard.BusManagementApi.Models.Dashboard;

namespace EverGoWebAPI.Repositories.Interfaces
{
    public interface IAlertRepository
    {
        Task<List<AlertDto>> GetAlertsAsync();
    }
}
