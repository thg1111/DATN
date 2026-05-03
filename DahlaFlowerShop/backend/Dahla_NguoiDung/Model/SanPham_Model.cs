using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model
{
    public class SanPham_Model
    {
        public int MaSanPham {  get; set; }
        public string TenSanPham { get; set; }
        public int MaDanhMuc { get; set; }
        public string MoTaSP { get; set; }
        public decimal? Gia { get; set; }
        public string AnhSP { get; set; }
        public int SL { get; set; }
    }

}
