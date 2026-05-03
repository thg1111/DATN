using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Model;

namespace BLL.Interface
{
    public interface bll_SanPham
    {
        List<SanPham_Model> GetDataAll();
        SanPham_Model GetSPbyID(string id);
        List<SanPham_Model> SearchSP(string TenSanPham);
    }
}
