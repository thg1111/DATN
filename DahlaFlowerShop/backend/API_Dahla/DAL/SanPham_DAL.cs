using DAL.Helper;
using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using DAL.Interfaces;
using static System.Net.Mime.MediaTypeNames;
namespace DAL
{
    public partial class SanPham_DAL : SanPhamRepository
    {
        private IDatabaseHelper _dbHelper;
        public SanPham_DAL(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }
        public bool CreateSP(SanPham_Model model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "them_sp",
                "@MaSanPham", model.MaSanPham,
                "@TenSanPham", model.TenSanPham,
                "@MaDanhMuc", model.MaDanhMuc,
                "@MoTaSP", model.MoTaSP,
                "@Gia", model.Gia,
                "@AnhSP", model.AnhSP,
                "@SL", model.SL);
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
        public bool UpdateSP(SanPham_Model model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sua_sp",
                "@MaSanPham", model.MaSanPham,
                "@TenSanPham", model.TenSanPham,
                "@MaDanhMuc", model.MaDanhMuc,
                "@MoTaSP", model.MoTaSP,
                "@Gia", model.Gia,
                "@AnhSP", model.AnhSP,
                "@SL", model.SL);
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
        public bool DeleteSP(string MaSanPham)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_delete_san_pham",
                    "@MaSanPham", MaSanPham);
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
