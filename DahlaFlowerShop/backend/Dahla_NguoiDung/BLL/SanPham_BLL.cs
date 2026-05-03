using DAL;
using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using DAL.Interfaces;
using BLL.Interface;

namespace BLL
{
    public class SanPham_BLL: bll_SanPham
    {
        private SanPhamRepository _sp;
        public SanPham_BLL(SanPhamRepository ItemGroupRes)
        {
            _sp = ItemGroupRes;
        }

        public List<SanPham_Model> GetDataAll()
        {
            return _sp.GetDataAll();
        }
        public SanPham_Model GetSPbyID(string id)
        {
            return _sp.GetSPbyID(id);
        }
        public List<SanPham_Model> SearchSP(string TenSanPham)
        {
            return _sp.SearchSP(TenSanPham);
        }
    }
}
