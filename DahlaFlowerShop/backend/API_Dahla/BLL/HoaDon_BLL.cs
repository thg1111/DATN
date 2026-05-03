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
using System.Drawing.Printing;

namespace BLL
{
    public class HoaDon_BLL : bll_HoaDon
    {
        private HoaDonReponsitory _res;
        private string Secret;
        public HoaDon_BLL(HoaDonReponsitory res, IConfiguration configuration)
        {
            Secret = configuration["AppSetting:Secret"];
            _res = res;
        }

        public bool Create(HoaDon_Model model)
        {
            return _res.Create(model);
        }

        public bool Delete(string id)
        {
            return _res.Delete(id);
        }

        public HoaDon_Model GetDatabyID(string id)
        {
            return _res.GetDatabyID(id);
        }

        public List<HoaDon_Model> Search(int pageIndex, int pageSize, out long total, string ngaymua, string diachi)
        {
            return _res.Search(pageIndex, pageSize, out total, ngaymua, diachi);
        }

        public bool Update(HoaDon_Model model)
        {
            return _res.Update(model);
        }
    }
}
