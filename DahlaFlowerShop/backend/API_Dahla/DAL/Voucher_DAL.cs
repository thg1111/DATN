using DAL.Helper;
using Model;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System;
using DAL.Interfaces;

namespace DAL
{
    public partial class Voucher_DAL: VoucherReponsitory
    {
        private IDatabaseHelper _dbHelper;
        public Voucher_DAL(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }
        public List<Voucher_Model> GetDataAll()
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_LayTatCaVoucher");
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<Voucher_Model>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public bool Create(Voucher_Model model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_ThemVoucher",
                "@Voucher_id", model.Voucher_id,
                "@Voucher_name", model.Voucher_name,
                "@GiaTien", model.GiaTien,
                "@GiaToiThieu", model.GiaToiThieu,
                "@SLCon", model.SLCon,
                "@BatDau", model.BatDau,
                "@KetThuc", model.KetThuc);
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
        public bool Update(Voucher_Model model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_SuaVoucher",
                "@Voucher_id", model.Voucher_id,
                "@Voucher_name", model.Voucher_name,
                "@GiaTien", model.GiaTien,
                "@GiaToiThieu", model.GiaToiThieu,
                "@SLCon", model.SLCon,
                "@BatDau", model.BatDau,
                "@KetThuc", model.KetThuc);
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
        public bool Delete(string Voucher_id)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_XoaVoucher",
                "@Voucher_id", Voucher_id);
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
        public List<Voucher_Model> Search(string Voucher_id)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_TimVoucher",
                    "@Voucher_id", Voucher_id);
                if (!string.IsNullOrEmpty(msgError.ToString()))
                {
                    throw new Exception(msgError.ToString());
                }
                return result.ConvertTo<Voucher_Model>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }

}
