using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BLL;
using BLL.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Model;
using static IdentityModel.OidcConstants;

namespace API_Dahla.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiKhoanConTroller:ControllerBase
    {
        private bll_TaiKhoan tkBus;
        private bll_NguoiDung ndBus;
        public TaiKhoanConTroller(bll_TaiKhoan taikhoan, bll_NguoiDung nguoiDung)
        {
            tkBus = taikhoan;
            ndBus = nguoiDung;
        }
        [Route("tk-create")]
        [HttpPost]
        public TaiKhoan_Model Create(TaiKhoan_Model model)
        {
            tkBus.Create(model);
            return model;
        }
        [Route("tk-update")]
        [HttpPost]
        public TaiKhoan_Model Update(TaiKhoan_Model model)
        {
            tkBus.Update(model);
            return model;
        }
        [Route("get-all-tk")]
        [HttpGet]
        public IEnumerable<TaiKhoan_Model> GetDatabAll()
        {
            return tkBus.GetDataAll();
        }
        [Route("Delete/{MaTK}")]
        [HttpDelete]
        public bool Delete(string MaTK)
        {
            return tkBus.Delete(MaTK);
        }
        [Route("Search/{TenTK}")]   
        [HttpGet]
        public List<TaiKhoan_Model> Search(string TenTK)
        {
            return tkBus.Search(TenTK);
        }

        [Route("get-by-id/{MaTK}")]
        [HttpGet]
        public TaiKhoan_Model GetByID(string MaTK)
        {
            var allTK = tkBus.GetDataAll();
            return allTK.FirstOrDefault(tk => tk.MaTK.ToString() == MaTK);
        }

        [AllowAnonymous]
        [Route("CheckLogin")]
        [HttpPost]
        public IActionResult CheckLogin([FromBody] LoginRequest_Model loginData)
        {
            var tenTK = loginData?.TenTK?.Trim();
            var matKhau = loginData?.MatKhau ?? string.Empty;

            if (string.IsNullOrWhiteSpace(tenTK) || string.IsNullOrWhiteSpace(matKhau))
            {
                return BadRequest(new { message = "Vui lòng nhập tên đăng nhập và mật khẩu" });
            }

            var allTK = tkBus.GetDataAll();
            var tk = allTK.FirstOrDefault(t =>
                string.Equals(t.TenTK?.Trim(), tenTK, StringComparison.OrdinalIgnoreCase)
                && string.Equals(t.MatKhau, matKhau, StringComparison.Ordinal));
            
            if (tk == null)
            {
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });
            }
            
            if (tk.TrangThai == "Khoá")
            {
                return Unauthorized(new { message = "Tài khoản đã bị khoá" });
            }

            return Ok(new { 
                maTK = tk.MaTK, 
                tenTK = tk.TenTK, 
                quyen = tk.Quyen, 
                email = tk.Email,
                maND = tk.MaTK
            });
        }

        [AllowAnonymous]
        [Route("reset-password")]
        [HttpPost]
        public IActionResult ResetPassword([FromBody] ForgotPasswordRequest_Model request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Vui lòng nhập thông tin khôi phục mật khẩu." });
            }

            var userId = request.UserId?.Trim();
            var email = request.Email?.Trim();
            var phoneDigits = new string((request.Phone ?? string.Empty).Where(char.IsDigit).ToArray());
            var newPassword = request.NewPassword ?? string.Empty;

            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(phoneDigits) || string.IsNullOrWhiteSpace(newPassword))
            {
                return BadRequest(new { message = "Vui lòng nhập tên đăng nhập, email, số điện thoại và mật khẩu mới." });
            }

            var allTK = tkBus.GetDataAll();
            var tk = allTK.FirstOrDefault(t => string.Equals(t.TenTK?.Trim(), userId, StringComparison.OrdinalIgnoreCase));
            var nd = tk == null ? null : ndBus.GetNDbyID(tk.MaTK.ToString());

            if (tk == null || nd == null)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản phù hợp với tên đăng nhập." });
            }

            var registeredPhone = nd.SDT.ToString().PadLeft(10, '0');
            var phoneMatched = string.Equals(registeredPhone, phoneDigits.PadLeft(10, '0'), StringComparison.Ordinal);
            var emailMatched = string.Equals(tk.Email?.Trim(), email, StringComparison.OrdinalIgnoreCase);

            if (!emailMatched || !phoneMatched)
            {
                return Unauthorized(new { message = "Tên đăng nhập, email hoặc số điện thoại không khớp với thông tin đăng ký." });
            }

            tk.MatKhau = newPassword;
            tkBus.Update(tk);

            return Ok(new { message = "Đổi mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
        }
    }
}
