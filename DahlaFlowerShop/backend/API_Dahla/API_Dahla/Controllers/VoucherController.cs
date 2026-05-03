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
    public class VoucherController: ControllerBase
    {
        private bll_Voucher vcBus;
        public VoucherController(bll_Voucher voucher)
        {
            vcBus = voucher;
        }
        [Route("voucher-create")]
        [HttpPost]
        public Voucher_Model Create(Voucher_Model model)
        {
            vcBus.Create(model);
            return model;
        }
        [Route("voucher-update")]
        [HttpPost]
        public Voucher_Model Update(Voucher_Model model)
        {
            vcBus.Update(model);
            return model;
        }
        [Route("get-all-voucher")]
        [HttpGet]
        public IEnumerable<Voucher_Model> GetDatabAll()
        {
            return vcBus.GetDataAll();
        }
        [Route("Delete/{Voucher_id}")]
        [HttpDelete]
        public bool Delete(string Voucher_id)
        {
            return vcBus.Delete(Voucher_id);
        }
        [Route("Search/{Voucher_name}")]
        [HttpGet]
        public List<Voucher_Model> Search(string Voucher_name)
        {
            return vcBus.Search(Voucher_name);
        }

        [Route("get-by-id/{Voucher_id}")]
        [HttpGet]
        public Voucher_Model GetByID(string Voucher_id)
        {
            var allVouchers = vcBus.GetDataAll().ToList();
            return allVouchers.FirstOrDefault(v => v.Voucher_id.ToString() == Voucher_id);
        }
    }
}
