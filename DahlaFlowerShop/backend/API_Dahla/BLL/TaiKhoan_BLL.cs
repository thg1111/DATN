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
    public class TaiKhoan_BLL : bll_TaiKhoan
    {
        private TaiKhoanReponsitory _res;
        private string Secret;
        public TaiKhoan_BLL(TaiKhoanReponsitory res, IConfiguration configuration)
        {
            Secret = configuration["AppSetting:Secret"];
            _res = res;
        }
        public bool Delete(string MaTK)
        {
            return _res.Delete(MaTK);
        }
        public bool Create(TaiKhoan_Model model)
        {
            return _res.Create(model);
        }
        public bool Update(TaiKhoan_Model model)
        {
            return _res.Update(model);
        }
        public List<TaiKhoan_Model> Search(string TenTK)
        {
            return _res.Search(TenTK);
        }
        public List<TaiKhoan_Model> GetDataAll() { 
            return _res.GetDataAll();
        }

    }
}
