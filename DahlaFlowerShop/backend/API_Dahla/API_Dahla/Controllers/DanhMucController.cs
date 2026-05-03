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
    public class DanhMucController:ControllerBase
    {
        private bll_DanhMuc dmBus;
        public DanhMucController (bll_DanhMuc danhmuc)
        {
            dmBus = danhmuc;

        }
        [Route("get-all")]
        [HttpGet]
        public List<DanhMuc_Model> GetDMAll()
        {
            return dmBus.GetDMAll();
        }
        [Route("search-DM/{TenDanhMuc}")]
        [HttpGet]
        public List<DanhMuc_Model> SearchDM(string TenDanhMuc)
        {
            return dmBus.SearchDM(TenDanhMuc);
        }
        [Route("dm-create")]
        [HttpPost]
        public DanhMuc_Model Create(DanhMuc_Model model)
        {
            dmBus.Create(model);
            return model;
        }
    }
}
