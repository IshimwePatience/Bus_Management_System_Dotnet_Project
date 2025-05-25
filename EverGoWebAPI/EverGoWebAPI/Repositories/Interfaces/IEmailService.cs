using EverGoWebAPI.DTOs;

namespace EverGoWebAPI.Repositories.Interfaces
{
    public interface IEmailService
    {
        Task SendBookingConfirmationEmailAsync(string toEmail, string passengerName, BookingDto booking);
        Task SendVerificationEmailAsync(string toEmail, string name, string verificationLink);
        Task SendAdminApprovalEmailAsync(string toEmail, string name, string driverEmail, string phone, string licenseNumber, DateTime? licenseExpiry, string approvalLink);

    }
}

