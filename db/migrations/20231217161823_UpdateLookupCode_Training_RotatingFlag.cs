using Microsoft.EntityFrameworkCore.Migrations;

namespace SS.Db.Migrations
{
    public partial class UpdateLookupCode_Training_RotatingFlag : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Rotating",
                table: "LookupCode",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rotating",
                table: "LookupCode");
        }
    }
}
