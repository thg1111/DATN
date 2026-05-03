using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface DanhMucReponsitory
    {
        List<DanhMuc_Model> SearchDM( string TenDanhMuc);
        List<DanhMuc_Model> GetDMAll();
        bool Create(DanhMuc_Model model);
    }
}
