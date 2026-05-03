using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface TaiKhoanReponsitory
    {
        List<TaiKhoan_Model> GetDataAll();
        bool Create(TaiKhoan_Model model);
        bool Update(TaiKhoan_Model model);
        bool Delete(string MaTK);
        List<TaiKhoan_Model> Search( string TenTK);
    }
}
