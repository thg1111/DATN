using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Model;

namespace DAL.Interfaces
{
    public interface VoucherReponsitory
    {
        List<Voucher_Model> GetDataAll();
        bool Create(Voucher_Model model);
        bool Update(Voucher_Model model);
        bool Delete(string Voucher_id);
        List<Voucher_Model> Search(string Voucher_name);
    }
}
