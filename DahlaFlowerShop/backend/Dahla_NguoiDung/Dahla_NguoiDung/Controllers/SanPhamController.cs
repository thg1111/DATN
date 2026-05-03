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
    public class SanPhamController : ControllerBase
    {
        private bll_SanPham spBus;

        public SanPhamController(bll_SanPham bus)
        {
            spBus = bus;
        }

        [Route("get-all-sp")]
        [HttpGet]
        public IEnumerable<SanPham_Model> GetDatabAll()
        {
            return spBus.GetDataAll();
        }

        [Route("get-by-id/{id}")]
        [HttpGet]
        public SanPham_Model GetSPbyID(string id)
        {
            return spBus.GetSPbyID(id);
        }

        [Route("get-by-danh-muc/{maDanhMuc}")]
        [HttpGet]
        public List<SanPham_Model> GetByDanhMuc(int maDanhMuc)
        {
            return spBus.GetDataAll().Where(sp => sp.MaDanhMuc == maDanhMuc).ToList();
        }

        [Route("Search/{TenSanPham}")]
        [HttpGet]
        public List<SanPham_Model> SearchSP(string TenSanPham)
        {
            return spBus.SearchSP(TenSanPham);
        }
    }
}
