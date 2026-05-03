using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model
{
    public class Feedback_Model
    {
        public int FeedbackID { get; set; }
        public int MaHD { get; set; }
        public int MaND { get; set; }
        public string NoiDung { get; set; }
        public DateTime? NgayTao    { get; set; }
    }
}
