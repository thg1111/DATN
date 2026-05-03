using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model
{
    public class ChiTietHD_Model
    {
        public int MaChiTietHD { get; set; }
        public int SLSP { get; set; }
        public decimal Gia { get; set; }
        public decimal SoTienGiam { get; set; }
        public int MaHD { get; set; }
        public int MaSanPham { get; set; }
        public int? MaVoucher { get; set; }
    }
}
