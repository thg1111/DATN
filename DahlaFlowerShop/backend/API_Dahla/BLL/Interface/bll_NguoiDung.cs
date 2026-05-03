using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interface
{
    public interface bll_NguoiDung
    {
        NguoiDung_Model GetNDbyID(string id);
        bool CreateND(NguoiDung_Model model);
        bool UpdateND(NguoiDung_Model model);
        bool DeleteND(string id);
        List<NguoiDung_Model> SearchND( string TenND);
    }
}
