using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Model;

namespace DAL.Interfaces
{
    public interface HoaDonReponsitory
    {
        bool Create(HoaDon_Model model);
        HoaDon_Model GetDatabyID(string id);
        bool Update(HoaDon_Model model);
        bool Delete(string id);
        List<HoaDon_Model> Search(int page_index, int page_size, out long total, string ngaymua, string diachi);
    }
}
