using DAL.Helper;
using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using DAL.Interfaces;
using static System.Net.Mime.MediaTypeNames;
using DAL.Helper.Interfaces;
namespace DAL
{
    public partial class SanPham_DAL : SanPhamRepository
    {
        private IDatabaseHelper _dbHelper;
        public SanPham_DAL(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }
       
        public List<SanPham_Model> GetDataAll()
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_san_pham_get_all");
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<SanPham_Model>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public SanPham_Model GetSPbyID(string id)
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "get_sp_id",
                     "@MaSanPham", id);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<SanPham_Model>().FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public List<SanPham_Model> SearchSP(string TenSanPham)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_TimSanPham",
                    "@TenSanPham", TenSanPham);
                if (!string.IsNullOrEmpty(msgError.ToString()))
                {
                    throw new Exception(msgError.ToString());
                }
                return result.ConvertTo<SanPham_Model>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
