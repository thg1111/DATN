using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model
{
    public class Voucher_Model
    {
        public int Voucher_id { get; set; }
        public string Voucher_name { get; set; }
        public decimal? GiaTien { get; set; }
        public decimal? GiaToiThieu { get; set; }
        public int SLCon {  get; set; }
        public DateTime? BatDau { get; set; }
        public DateTime? KetThuc { get;set; }
    }
}
