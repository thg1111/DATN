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
    public class NguoiDung_BLL : bll_NguoiDung
    {
        private NguoiDungReponsitory _res;
        private string Secret;
        public NguoiDung_BLL(NguoiDungReponsitory res, IConfiguration configuration)
        {
            Secret = configuration["AppSetting:Secret"];
            _res = res;
        }
        public bool DeleteND(string id)
        {
            return _res.DeleteND(id);
        }
        public NguoiDung_Model GetNDbyID(string id)
        {
            return _res.GetNDbyID(id);
        }
        public bool CreateND(NguoiDung_Model model)
        {
            return _res.CreateND(model);
        }
        public bool UpdateND(NguoiDung_Model model)
        {
            return _res.UpdateND(model);
        }
        public List<NguoiDung_Model> SearchND(string TenND)
        {
            return _res.SearchND( TenND);
        }
    }
}
