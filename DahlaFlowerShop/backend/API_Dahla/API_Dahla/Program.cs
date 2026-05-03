using BLL;
using DAL.Interfaces;
using DAL;
using DAL.Interfaces;
using DAL.Helper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BLL.Interface;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMemoryCache();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
// Add services to the container.
builder.Services.AddTransient<IDatabaseHelper, DatabaseHelper>();
builder.Services.AddTransient<SanPhamRepository, SanPham_DAL>();
builder.Services.AddTransient<bll_SP, SanPham_BLL>();
builder.Services.AddTransient<NguoiDungReponsitory, NguoiDung_DAL >();
builder.Services.AddTransient<bll_NguoiDung, NguoiDung_BLL>();
builder.Services.AddTransient<DanhMucReponsitory, DanhMuc_DAL>();
builder.Services.AddTransient<bll_DanhMuc, DanhMuc_BLL>();
builder.Services.AddTransient<HoaDonReponsitory, HoaDon_DAL>();
builder.Services.AddTransient<bll_HoaDon, HoaDon_BLL>();
builder.Services.AddTransient<TaiKhoanReponsitory, TaiKhoan_DAL>();
builder.Services.AddTransient<bll_TaiKhoan, TaiKhoan_BLL>();
builder.Services.AddTransient<VoucherReponsitory, Voucher_DAL>();
builder.Services.AddTransient<bll_Voucher, Voucher_BLL>();

// configure strongly typed settings objects
IConfiguration configuration = builder.Configuration;
var appSettingsSection = configuration.GetSection("AppSettings");
builder.Services.Configure<AppSetting>(appSettingsSection);

// configure jwt authentication
var appSettings = appSettingsSection.Get<AppSetting>();
var key = Encoding.ASCII.GetBytes(appSettings.Secret);
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();
// Configure the HTTP request pipeline.          
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseRouting();
app.UseCors(x => x
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();


