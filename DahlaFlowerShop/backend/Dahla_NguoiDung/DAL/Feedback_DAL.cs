using DAL.Helper;
using Model;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System;
using DAL.Interfaces;
using System.Data;
using DAL.Helper.Interfaces;

namespace DAL
{
    public partial class Feedback_DAL:FeedbackReponsitory
    {
        private IDatabaseHelper _dbHelper;
        public Feedback_DAL(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }
        public List<Feedback_Model> GetDataAll()
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_GetAllFeedbacks");
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<Feedback_Model>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public bool Create(Feedback_Model model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_InsertFeedback",
                "@FeedbackID", model.FeedbackID,
                "@MaHD", model.MaHD,
                "@MaND", model.MaND,
                "@NoiDung", model.NoiDung,
                "@NgayTao", model.NgayTao);
                if ((result != null && !string.IsNullOrEmpty(result.ToString())) || !string.IsNullOrEmpty(msgError))
                {
                    throw new Exception(Convert.ToString(result) + msgError);
                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public bool Delete(string FeedbackID)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_DeleteFeedback",
                "@FeedbackID", FeedbackID);
                if ((result != null && !string.IsNullOrEmpty(result.ToString())) || !string.IsNullOrEmpty(msgError))
                {
                    throw new Exception(Convert.ToString(result) + msgError);
                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
