using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Model;

namespace DAL.Interfaces
{
    public interface FeedbackReponsitory
    {
        List<Feedback_Model> GetDataAll();
        bool Create(Feedback_Model model);
        bool Delete(string FeedbackID);
    }
}
