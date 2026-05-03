using System;
using System.Collections.Generic;
using System.Drawing.Printing;
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
    public class HoaDonController:ControllerBase
    {
        private bll_HoaDon hdBus;
        public HoaDonController (bll_HoaDon hoadon)
        {
            hdBus = hoadon;
        }
        [Route("hd-create")]
        [HttpPost]
        public HoaDon_Model Create(HoaDon_Model  model)
        {
            hdBus.Create(model);
            return model;
        }
        [Route("get-all-hd")]
        [HttpGet]
        public IActionResult GetAllHD()
        {
            try
            {
                long total = 0;
                var data = hdBus.Search(1, 1000, out total, "", "");
                return Ok(data);
            }
            catch
            {
                return Ok(new List<HoaDon_Model>());
            }
        }
        [Route("hd-update")]
        [HttpPost]
        public HoaDon_Model Update(HoaDon_Model model)
        {
            hdBus.Update(model);
            return model;
        }
        [Route("hd-delete/{id}")]
        [HttpPost]
        public bool Delete(string id)
        {
            return hdBus.Delete(id);
        }
        [Route("get-data-by-id/{id}")]
        [HttpGet]
        public HoaDon_Model GetDatabyID(string id)
        {
            return hdBus.GetDatabyID(id);
        }
        [Route("search-hd")]
        [HttpPost]
        public Reponse_Model Search([FromBody] Dictionary<string, object> formData)
        {
            var response = new Reponse_Model();
            try
            {
                var page_index = int.Parse(formData["page_index"].ToString());
                var page_size = int.Parse(formData["Page_size"].ToString());
                string ngaymua = "";
                if (formData.Keys.Contains("NgayMua") && !string.IsNullOrEmpty(Convert.ToString(formData["NgayMua"]))) { ngaymua = Convert.ToString(formData["NgayMua"]); }
                string diachi = "";
                if (formData.Keys.Contains("DiaChiGiao") && !string.IsNullOrEmpty(Convert.ToString(formData["DiaChiGiao"]))) { diachi = Convert.ToString(formData["DiaChiGiao"]); }
                long total = 0;
                var data = hdBus.Search(page_index, page_size, out total, ngaymua, diachi);
                response.TotalItems = total;
                response.Data = data;
                response.Page = page_index;
                response.PageSize = page_size;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return response;
        }

    }
}
