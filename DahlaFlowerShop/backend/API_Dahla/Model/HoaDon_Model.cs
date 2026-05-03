using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model
{
    public class HoaDon_Model
    {
        public int MaHD { get; set; }
        public DateTime NgayMua { get; set; }
        public decimal TongTien { get; set; }
        public string TrangThai { get; set; }
        public string DiaChiGiao { get; set; }
        public int MaND { get; set; }
        public List<ChiTietHD_Model> listjson_chitiet { get; set; }

    }
}
