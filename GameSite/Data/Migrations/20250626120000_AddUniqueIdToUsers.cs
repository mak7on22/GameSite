using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameSite.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueIdToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UniqueId",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_UniqueId",
                table: "AspNetUsers",
                column: "UniqueId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_UniqueId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "UniqueId",
                table: "AspNetUsers");
        }
    }
}
