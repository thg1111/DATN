using DAL;
using Microsoft.IdentityModel.Tokens;
using Model;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using BLL.Interface;
using DAL.Interfaces;

namespace BLL
{
    public class Voucher_BLL:bll_Voucher
    {
        private VoucherReponsitory _res;
        private string Secret;
        public Voucher_BLL(VoucherReponsitory res, IConfiguration configuration)
        {
            Secret = configuration["AppSetting:Secret"];
            _res = res;
        }
        public bool Delete(string Voucher_id)
        {
            return _res.Delete(Voucher_id);
        }
        public bool Create(Voucher_Model model)
        {
            return _res.Create(model);
        }
        public bool Update(Voucher_Model model)
        {
            return _res.Update(model);
        }
        public List<Voucher_Model> Search(string Voucher_name)
        {
            return _res.Search(Voucher_name);
        }
        public List<Voucher_Model> GetDataAll()
        {
            return _res.GetDataAll();
        }
    }
}
