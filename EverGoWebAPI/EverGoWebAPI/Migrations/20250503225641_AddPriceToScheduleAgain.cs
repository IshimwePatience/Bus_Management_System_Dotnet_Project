using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EverGoWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPriceToScheduleAgain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "Bookings",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Amount",
                table: "Bookings");
        }
    }
}
