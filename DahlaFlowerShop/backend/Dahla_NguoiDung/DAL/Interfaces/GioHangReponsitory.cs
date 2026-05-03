using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Model;

namespace DAL.Interfaces
{
    public interface GioHangReponsitory
    {
        List<GioHang_Model> GetDataAll();
        bool Create(GioHang_Model model);
        bool Delete(string MaSanPham);
        bool Update(GioHang_Model model);
    }
}
