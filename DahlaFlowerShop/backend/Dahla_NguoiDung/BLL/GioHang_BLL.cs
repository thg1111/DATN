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
    public class GioHang_BLL:bll_GioHang
    {
        private GioHangReponsitory _res;
        private string Secret;
        public GioHang_BLL(GioHangReponsitory res, IConfiguration configuration)
        {
            Secret = configuration["AppSetting:Secret"];
            _res = res;
        }
        public bool Delete(string MaSanPham)
        {
            return _res.Delete(MaSanPham);
        }
        public bool Create(GioHang_Model model)
        {
            return _res.Create(model);
        }
        public bool Update(GioHang_Model model)
        {
            return _res.Update(model);
        }
        public List<GioHang_Model> GetDataAll()
        {
            return _res.GetDataAll();
        }
    }
}
