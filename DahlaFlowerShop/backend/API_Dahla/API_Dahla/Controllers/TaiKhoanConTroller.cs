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
        public TaiKhoanConTroller(bll_TaiKhoan taikhoan)
        {
            tkBus = taikhoan;
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
    }
}
