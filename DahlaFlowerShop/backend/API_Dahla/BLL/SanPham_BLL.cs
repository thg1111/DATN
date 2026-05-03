using DAL;
using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using DAL.Interfaces;

namespace BLL
{
    public class SanPham_BLL:bll_SP
    {
        private SanPhamRepository _sp;
        public SanPham_BLL(SanPhamRepository ItemGroupRes)
        {
            _sp = ItemGroupRes;
        }

        public bool CreateSP(SanPham_Model model)
        {
            return _sp.CreateSP(model);
        }
        public bool UpdateSP(SanPham_Model model)
        {
            return _sp.UpdateSP(model);
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
        public bool DeleteSP(string MaSanPham)
        {
            return _sp.DeleteSP(MaSanPham);
        }
    }
}
