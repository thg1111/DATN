using DAL.Helper;
using Model;
using DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public partial class HoaDon_DAL : HoaDonReponsitory
    {
        private IDatabaseHelper _dbHelper;
        public HoaDon_DAL(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }
        public bool Create(HoaDon_Model model)
        {
            string msgError = "";
            try
            {
                var xxx = MessageConvert.SerializeObject(model.listjson_chitiet);
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_create",
                "@MaHD", model.MaHD,
                "@NgayMua", model.NgayMua,
                "@TongTien", model.TongTien,
                "@TrangThai", model.TrangThai,
                "@DiaChiGiao", model.DiaChiGiao,
                "@MaND", model.MaND,
                "@listjson_chitiet", model.listjson_chitiet != null ? MessageConvert.SerializeObject(model.listjson_chitiet) : null);
                if ((result != null && !string.IsNullOrEmpty(result.ToString())) || !string.IsNullOrEmpty(msgError))
                {
                    return false;
                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public bool Delete(string id)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_xoa",
                "@MaHD", id);
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
        public bool Update(HoaDon_Model model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_UpdateHoaDon",
                "@MaHD", model.MaHD,
                "@NgayMua", model.NgayMua,
                "@TongTien", model.TongTien,
                "@TrangThai", model.TrangThai,
                "@DiaChiGiao", model.DiaChiGiao,
                "@MaND", model.MaND,
                "@listjson_chitiet", model.listjson_chitiet != null ? MessageConvert.SerializeObject(model.listjson_chitiet) : null);
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
        public HoaDon_Model GetDatabyID(string id)
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_get_id",
                     "@MaHD", id);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<HoaDon_Model>().FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public List<HoaDon_Model> Search(int page_index, int page_size, out long total, string ngaymua, string diachi)
        {
            string msgError = "";
            total = 0;
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_SearchHoaDon",
                    "@page_index", page_index,
                    "@page_size", page_size,
                    "@NgayMua", ngaymua,
                    "@DiaChiGiao", diachi);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                if (dt.Rows.Count > 0) total = Convert.ToInt64(dt.Rows[0]["RecordCount"]);
                return dt.ConvertTo<HoaDon_Model>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
