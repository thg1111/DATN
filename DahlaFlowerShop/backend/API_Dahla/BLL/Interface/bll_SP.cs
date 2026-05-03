using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public interface bll_SP
    {
        bool CreateSP(SanPham_Model model);
        bool UpdateSP(SanPham_Model model);
        List<SanPham_Model> GetDataAll();
        SanPham_Model GetSPbyID(string id);
        List<SanPham_Model> SearchSP(string TenSanPham);
        bool DeleteSP(string MaSanPham);
    }
}
