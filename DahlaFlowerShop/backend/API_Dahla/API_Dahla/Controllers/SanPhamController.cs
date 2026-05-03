using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BLL;
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
    public class SanPhamController:ControllerBase
    {
        private bll_SP spBus;
       
        public SanPhamController(bll_SP bus)
        {
            spBus = bus;
        }


        [Route("sp-create")]
        [HttpPost]
        public SanPham_Model CreateSP(SanPham_Model model)
        {
            spBus.CreateSP(model);
            return model;
        }


        [Route("sp-update")]
        [HttpPost]
        public SanPham_Model UpdateSP(SanPham_Model model)
        {
            spBus.UpdateSP(model);
            return model;
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

        [Route("Search/{TenSanPham}")]
        [HttpGet]
        public List<SanPham_Model> SearchSP(string TenSanPham)
        {
            return spBus.SearchSP(TenSanPham);
        }

        [Route("Delete/{MaSanPham}")]
        [HttpDelete]
        public bool DeleteSP(string MaSanPham)
        {
            return spBus.DeleteSP(MaSanPham);
        }
    }
}
