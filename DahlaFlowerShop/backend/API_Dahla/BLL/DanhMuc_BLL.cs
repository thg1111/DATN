using DAL;
using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using DAL.Interfaces;
using BLL.Interface;
using Microsoft.Extensions.Configuration;

namespace BLL
{
    public class DanhMuc_BLL : bll_DanhMuc
    {
        private DanhMucReponsitory _dm;
        private string Secret;
        public DanhMuc_BLL(DanhMucReponsitory res, IConfiguration configuration)
        {
            Secret = configuration["AppSetting:Secret"];
            _dm = res;
        }
        public List<DanhMuc_Model> GetDMAll()
        {
            return _dm.GetDMAll();
        }
        public List<DanhMuc_Model> SearchDM( string TenDanhMuc)
        {
            return _dm.SearchDM(TenDanhMuc);
        }
        public bool Create(DanhMuc_Model model)
        {
            return _dm.Create(model);
        }

    }
}
