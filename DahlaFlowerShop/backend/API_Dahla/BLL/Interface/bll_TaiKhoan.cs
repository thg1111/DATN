using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Model;

namespace BLL.Interface
{
    public interface bll_TaiKhoan
    {
        List<TaiKhoan_Model> GetDataAll();
        bool Create(TaiKhoan_Model model);
        bool Update(TaiKhoan_Model model);
        bool Delete(string MaTK);
        List<TaiKhoan_Model> Search(string TenTK);
    }
}
