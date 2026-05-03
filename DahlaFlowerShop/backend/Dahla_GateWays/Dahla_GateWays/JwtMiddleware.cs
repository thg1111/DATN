using Dahla_GateWays.Helper;
using Dahla_GateWays.Model;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;

namespace Dahla_GateWays
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly AppSettings _appSettings;
        private DahlaContext db = null;
        public JwtMiddleware(RequestDelegate next, IOptions<AppSettings> appSettings, IConfiguration configuration)
        {
            _next = next;
            _appSettings = appSettings.Value;
            db = new DahlaContext();
        }

        public Task Invoke(HttpContext context)
        {
            context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
            context.Response.Headers.Add("Access-Control-Expose-Headers", "*");
            if (!context.Request.Path.Equals("/api/token", StringComparison.Ordinal))
            {
                return _next(context);
            }
            if (context.Request.Method.Equals("POST") && context.Request.HasFormContentType)
            {
                return GenerateToken(context);
            }
            context.Response.StatusCode = 400;
            return context.Response.WriteAsync("Bad request.");
        }

        public async Task GenerateToken(HttpContext context)
        {
            //var Taikhoan = context.Request.Form["Taikhoan"].ToString();
            //var Matkhau = context.Request.Form["Matkhau"].ToString();
            //var user = db.tk.SingleOrDefault(x => x.Taikhoan == Taikhoan && x.Matkhau == Matkhau);
            //return null if user not found
            //if (user == null)
            //{
            //    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            //    var result = JsonConvert.SerializeObject(new { code = (int)HttpStatusCode.BadRequest, error = "Tài khoản hoặc mật khẩu không đúng" });
            //    await context.Response.WriteAsync(result);
            //    return;
            //}

            //authentication successful so generate jwt token
            //var tokenHandler = new JwtSecurityTokenHandler();
            //var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
            //var tokenDescriptor = new SecurityTokenDescriptor
            //{
            //    Subject = new ClaimsIdentity(new Claim[]
            //    {
            //        new Claim(ClaimTypes.Name, user.tk.ToString()),
            //        new Claim(ClaimTypes.Role, user.Email),
            //    }),
            //    Expires = DateTime.UtcNow.AddDays(7),
            //    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            //};
            //var tmp = tokenHandler.CreateToken(tokenDescriptor);
            //var token = tokenHandler.WriteToken(tmp);
            //var response = new { HoTen = user.Hoten, Token = token };
            //var serializerSettings = new JsonSerializerSettings
            //{
            //    Formatting = Formatting.Indented
            //};
            //context.Response.ContentType = "application/json";
            //await context.Response.WriteAsync(JsonConvert.SerializeObject(response, serializerSettings));
            return;
        }
    }
}
