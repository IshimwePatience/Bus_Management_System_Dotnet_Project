using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EverGoWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserModelAgain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_AdminApprovalToken",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_VerificationToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AdminApprovalToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsEmailVerified",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "VerificationToken",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "LicenseImage",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LicenseImage",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "AdminApprovalToken",
                table: "Users",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsEmailVerified",
                table: "Users",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerificationToken",
                table: "Users",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_AdminApprovalToken",
                table: "Users",
                column: "AdminApprovalToken",
                unique: true,
                filter: "[AdminApprovalToken] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_VerificationToken",
                table: "Users",
                column: "VerificationToken",
                unique: true,
                filter: "[VerificationToken] IS NOT NULL");
        }
    }
}
