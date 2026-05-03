using DAL.Helper;
using Model;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System;
using DAL.Interfaces;

namespace DAL
{
    public partial class TaiKhoan_DAL : TaiKhoanReponsitory
    {
        private IDatabaseHelper _dbHelper;
        public TaiKhoan_DAL(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }
        public List<TaiKhoan_Model> GetDataAll()
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_LayTatCaTaiKhoan");
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<TaiKhoan_Model>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public bool Create(TaiKhoan_Model model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_ThemTK",
                "@MaTK", model.MaTK,
                "@TenTK", model.TenTK,
                "@MatKhau", model.MatKhau,
                "@Quyen", model.Quyen,
                "@Email", model.Email,
                "@TrangThai", model.TrangThai);
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
        public bool Update(TaiKhoan_Model model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_SuaTaiKhoan",
                "@MaTK", model.MaTK,
                "@TenTK", model.TenTK,
                "@MatKhau", model.MatKhau,
                "@Quyen", model.Quyen,
                "@Email", model.Email,
                "@TrangThai", model.TrangThai);
                if (IsMissingStoredProcedure(msgError, "sp_SuaTaiKhoan"))
                {
                    return UpdateDirect(model);
                }

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

        private bool IsMissingStoredProcedure(string msgError, string procedureName)
        {
            return !string.IsNullOrEmpty(msgError)
                && msgError.IndexOf("Could not find stored procedure", StringComparison.OrdinalIgnoreCase) >= 0
                && msgError.IndexOf(procedureName, StringComparison.OrdinalIgnoreCase) >= 0;
        }

        private bool UpdateDirect(TaiKhoan_Model model)
        {
            var databaseHelper = _dbHelper as DatabaseHelper;
            if (databaseHelper == null || string.IsNullOrWhiteSpace(databaseHelper.StrConnection))
            {
                throw new Exception("Không thể lấy chuỗi kết nối để cập nhật tài khoản.");
            }

            using (var connection = new SqlConnection(databaseHelper.StrConnection))
            using (var command = connection.CreateCommand())
            {
                command.CommandType = CommandType.Text;
                command.CommandText = @"
UPDATE dbo.TaiKhoan
SET TenTK = @TenTK,
    MatKhau = @MatKhau,
    Quyen = @Quyen,
    Email = @Email,
    TrangThai = @TrangThai
WHERE MaTK = @MaTK;";

                command.Parameters.Add("@MaTK", SqlDbType.Int).Value = model.MaTK;
                command.Parameters.Add("@TenTK", SqlDbType.NVarChar, 100).Value = (object)model.TenTK ?? DBNull.Value;
                command.Parameters.Add("@MatKhau", SqlDbType.NVarChar, 100).Value = (object)model.MatKhau ?? DBNull.Value;
                command.Parameters.Add("@Quyen", SqlDbType.NVarChar, 50).Value = (object)model.Quyen ?? DBNull.Value;
                command.Parameters.Add("@Email", SqlDbType.NVarChar, 100).Value = (object)model.Email ?? DBNull.Value;
                command.Parameters.Add("@TrangThai", SqlDbType.NVarChar, 50).Value = (object)model.TrangThai ?? DBNull.Value;

                connection.Open();
                var affectedRows = command.ExecuteNonQuery();
                if (affectedRows <= 0)
                {
                    throw new Exception("Không tìm thấy tài khoản cần cập nhật.");
                }
            }

            return true;
        }
        public bool Delete(string MaTK)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "sp_XoaTaiKhoan",
                "@MaTK", MaTK);
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
        public List<TaiKhoan_Model> Search(string TenTK)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_TimKiemTaiKhoan",
                    "@TenTK", TenTK);
                if (!string.IsNullOrEmpty(msgError.ToString()))
                {
                    throw new Exception(msgError.ToString());
                }
                return result.ConvertTo<TaiKhoan_Model>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
