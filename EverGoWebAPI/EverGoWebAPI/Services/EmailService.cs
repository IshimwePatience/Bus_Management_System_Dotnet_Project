using EverGoWebAPI.DTOs;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.Extensions.Options;
using QRCoder;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Threading.Tasks;

namespace EverGoWebAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly SendGridSettings _sendGridSettings;

        public EmailService(IOptions<SendGridSettings> sendGridSettings)
        {
            _sendGridSettings = sendGridSettings.Value;
        }

        public async Task SendBookingConfirmationEmailAsync(string toEmail, string passengerName, BookingDto booking)
        {
            var client = new SendGridClient(_sendGridSettings.ApiKey);
            var from = new EmailAddress(_sendGridSettings.FromEmail, _sendGridSettings.FromName);
            var to = new EmailAddress(toEmail, passengerName);
            var subject = "Your EverGo Booking Confirmation";

            // Validate QrCodeData
            if (string.IsNullOrEmpty(booking.QrCodeData))
            {
                Console.WriteLine("QrCodeData is missing in booking object.");
                throw new Exception("QrCodeData is missing in booking object.");
            }

            // Generate QR Code as PNG bytes using QRCoder's PngByteQRCode
            byte[] qrCodeBytes;
            try
            {
                var qrGenerator = new QRCodeGenerator();
                var qrCodeData = qrGenerator.CreateQrCode(booking.QrCodeData, QRCodeGenerator.ECCLevel.Q);
                var qrCode = new PngByteQRCode(qrCodeData);
                qrCodeBytes = qrCode.GetGraphic(20); // 20 pixels per module
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to generate QR code: {ex.Message}");
                throw new Exception("Failed to generate QR code.", ex);
            }

            var htmlContent = $@"
                <h2>Booking Confirmation</h2>
                <p>Dear {passengerName},</p>
                <p>Thank you for booking with EverGo! Here are your ticket details:</p>
                <ul>
                    <li><strong>Booking Reference:</strong> {booking.BookingReference}</li>
                    <li><strong>Ticket Code:</strong> {booking.TicketCode}</li>
                    <li><strong>Passenger Name:</strong> {booking.PassengerName}</li>
                    <li><strong>Schedule:</strong> {booking.Schedule.DepartureTime} on {booking.Schedule.TripDate}</li>
                    <li><strong>Pickup Point:</strong> {booking.PickupPoint}</li>
                    <li><strong>Number of Seats:</strong> {booking.NumberOfSeats}</li>
                    <li><strong>Total Amount:</strong> {booking.Amount} RWF</li>
                </ul>
                <p><strong>QR Code:</strong> Please find your QR code attached to this email as 'ticket_qr.png'. Present this at the time of boarding.</p>
                <p>Safe travels!</p>
                <p>EverGo Team</p>
            ";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);
            msg.AddAttachment("ticket_qr.png", Convert.ToBase64String(qrCodeBytes), "image/png");

            var response = await client.SendEmailAsync(msg);

            if (response.StatusCode != System.Net.HttpStatusCode.OK && response.StatusCode != System.Net.HttpStatusCode.Accepted)
            {
                Console.WriteLine($"Failed to send email: StatusCode={response.StatusCode}");
                throw new Exception("Failed to send email.");
            }
        }

        public async Task SendVerificationEmailAsync(string toEmail, string name, string otp)
        {
            var client = new SendGridClient(_sendGridSettings.ApiKey);
            var from = new EmailAddress(_sendGridSettings.FromEmail, _sendGridSettings.FromName);
            var to = new EmailAddress(toEmail, name);
            var subject = "Your EverGo Login OTP";

            var htmlContent = $@"
                <h2>Login Verification</h2>
                <p>Dear {name},</p>
                <p>Your One-Time Password (OTP) for login is:</p>
                <h3 style='color: #FF5733;'>{otp}</h3>
                <p>Please enter this OTP in the login form within 5 minutes. If you did not request this, please ignore this email or contact support.</p>
                <p>EverGo Team</p>
            ";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);
            var response = await client.SendEmailAsync(msg);

            if (response.StatusCode != System.Net.HttpStatusCode.OK && response.StatusCode != System.Net.HttpStatusCode.Accepted)
            {
                Console.WriteLine($"Failed to send verification email: StatusCode={response.StatusCode}, Body={await response.Body.ReadAsStringAsync()}");
                throw new Exception("Failed to send verification email.");
            }
        }

        public async Task SendAdminApprovalEmailAsync(string toEmail, string name, string driverEmail, string phone, string licenseNumber, DateTime? licenseExpiry, string approvalLink)
        {
            var client = new SendGridClient(_sendGridSettings.ApiKey);
            var from = new EmailAddress(_sendGridSettings.FromEmail, _sendGridSettings.FromName);
            var to = new EmailAddress(toEmail, "EverGo Admin");
            var subject = "New Driver Registration Awaiting Approval";

            var htmlContent = $@"
                <h2>New Driver Registration</h2>
                <p>A new driver has registered with EverGo. Please review the details below and approve the account:</p>
                <ul>
                    <li><strong>Name:</strong> {name}</li>
                    <li><strong>Email:</strong> {driverEmail}</li>
                    <li><strong>Phone:</strong> {phone}</li>
                    <li><strong>License Number:</strong> {licenseNumber}</li>
                    <li><strong>License Expiry:</strong> {licenseExpiry?.ToString("yyyy-MM-dd") ?? "N/A"}</li>
                </ul>
                <p><a href='{approvalLink}'>Approve Driver Account</a></p>
                <p>This link will expire in 24 hours. If you did not expect this request, please contact support.</p>
                <p>EverGo Team</p>
            ";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);
            var response = await client.SendEmailAsync(msg);

            if (response.StatusCode != System.Net.HttpStatusCode.OK && response.StatusCode != System.Net.HttpStatusCode.Accepted)
            {
                Console.WriteLine($"Failed to send admin approval email: StatusCode={response.StatusCode}");
                throw new Exception("Failed to send admin approval email.");
            }
        }
    }
}