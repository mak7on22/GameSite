using Microsoft.EntityFrameworkCore.Migrations;

namespace GameSite.Data.Migrations
{
    public partial class EmailVisibility : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsEmailPublic",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsEmailPublic",
                table: "AspNetUsers");
        }
    }
}
