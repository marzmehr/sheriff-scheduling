using Microsoft.EntityFrameworkCore.Migrations;

namespace SS.Db.Migrations
{
    public partial class UpdateSheriff_Add_Excused : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Excused",
                table: "User",
                type: "boolean",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Excused",
                table: "User");
        }
    }
}
