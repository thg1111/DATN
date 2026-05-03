using Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Interfaces
{
    public interface SanPhamRepository
    {

        List<SanPham_Model> GetDataAll();
        SanPham_Model GetSPbyID(string id);
        List<SanPham_Model> SearchSP(string TenSanPham);
    }
}