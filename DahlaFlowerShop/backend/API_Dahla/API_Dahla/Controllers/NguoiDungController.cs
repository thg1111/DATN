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
    public class NguoiDungController:ControllerBase
    {
        private bll_NguoiDung ndBus;
        public NguoiDungController (bll_NguoiDung nguoiDung)
        {
            ndBus = nguoiDung;
        }
        [AllowAnonymous]
        [Route("nd-create")]
        [HttpPost]
        public NguoiDung_Model CreateND(NguoiDung_Model model)
        {
            ndBus.CreateND(model);
            return model;
        }
        [Route("nd-update")]
        [HttpPost]
        public NguoiDung_Model UpdateND(NguoiDung_Model model)
        {
            ndBus.UpdateND(model);
            return model;
        }
        [Route("nd-Delete/{id}")]
        [HttpDelete]
        public bool DeleteND(string id)
        {
            return ndBus.DeleteND(id);
        }
        [Route("get-all-nd")]
        [HttpGet]
        public List<NguoiDung_Model> GetAllND()
        {
            // Lấy tất cả người dùng dựa trên việc tìm kiếm rỗng
            return ndBus.SearchND("");
        }

        [Route("get-by-id/{id}")]
        [HttpGet]
        public NguoiDung_Model GetNDbyID(string id)
        {
            return ndBus.GetNDbyID(id);
        }
        [Route("Search/{TenND}")]
        [HttpGet]
        public List<NguoiDung_Model> SearchND(string TenND)
        {
            return ndBus.SearchND(TenND);
        }   

    }
}
