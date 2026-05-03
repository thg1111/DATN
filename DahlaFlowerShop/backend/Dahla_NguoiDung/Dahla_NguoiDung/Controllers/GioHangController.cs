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

namespace Dahla_NguoiDung.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GioHangController: ControllerBase
    {
        private bll_GioHang ghBus;
        public GioHangController(bll_GioHang gioHang)
        {
            ghBus = gioHang;
        }
        [Route("GioHang-create")]
        [HttpPost]
        public GioHang_Model Create(GioHang_Model model)
        {
            ghBus.Create(model);
            return model;
        }
        [Route("GioHang-update")]
        [HttpPost]
        public GioHang_Model Update(GioHang_Model model)
        {
            ghBus.Update(model);
            return model;
        }
        [Route("get-all-GioHang")]
        [HttpGet]
        public IEnumerable<GioHang_Model> GetDatabAll()
        {
            return ghBus.GetDataAll();
        }
        [Route("Delete/{MaSanPham}")]
        [HttpDelete]
        public bool Delete(string MaSanPham)
        {
            return ghBus.Delete(MaSanPham);
        }
    }
}
