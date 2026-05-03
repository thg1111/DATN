using DAL.Helper;
using Model;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System;
using DAL.Interfaces;
using static System.Net.Mime.MediaTypeNames;
namespace DAL
{
    public partial class NguoiDung_DAL : NguoiDungReponsitory
    {
        private IDatabaseHelper _dbHelper;
        public NguoiDung_DAL(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }
        public NguoiDung_Model GetNDbyID(string id)
        {
            string msgError = "";
            try
            {
                var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "nguoidung_get_id",
                     "MaND", id);
                if (!string.IsNullOrEmpty(msgError))
                    throw new Exception(msgError);
                return dt.ConvertTo<NguoiDung_Model>().FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public bool CreateND(NguoiDung_Model model)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "them_nguoidung",
                "@MaND", model.MaND,
                "@TenND", model.TenND,
                "@SinhNhat", model.SinhNhat,
                "@DiaChi", model.DiaChi,
                "@SDT", model.SDT,
                "@Anh", model.Anh,
                "@GioiTinh", model.GioiTinh);
                if (IsMissingStoredProcedure(msgError, "them_nguoidung"))
                {
                    return CreateNDDirect(model);
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

        private bool CreateNDDirect(NguoiDung_Model model)
        {
            var databaseHelper = _dbHelper as DatabaseHelper;
            if (databaseHelper == null || string.IsNullOrWhiteSpace(databaseHelper.StrConnection))
            {
                throw new Exception("Không thể lấy chuỗi kết nối để tạo người dùng.");
            }

            using (var connection = new SqlConnection(databaseHelper.StrConnection))
            using (var command = connection.CreateCommand())
            {
                command.CommandType = CommandType.Text;
                command.CommandText = @"
INSERT INTO dbo.NguoiDung (MaND, TenND, SinhNhat, DiaChi, SDT, Anh, GioiTinh)
VALUES (@MaND, @TenND, @SinhNhat, @DiaChi, @SDT, @Anh, @GioiTinh);";

                command.Parameters.Add("@MaND", SqlDbType.Int).Value = model.MaND;
                command.Parameters.Add("@TenND", SqlDbType.NVarChar, 100).Value = (object)model.TenND ?? DBNull.Value;
                command.Parameters.Add("@SinhNhat", SqlDbType.Date).Value = (object)model.SinhNhat ?? DBNull.Value;
                command.Parameters.Add("@DiaChi", SqlDbType.NVarChar, 100).Value = (object)model.DiaChi ?? DBNull.Value;
                command.Parameters.Add("@SDT", SqlDbType.Int).Value = model.SDT;
                command.Parameters.Add("@Anh", SqlDbType.NVarChar, -1).Value = (object)model.Anh ?? DBNull.Value;
                command.Parameters.Add("@GioiTinh", SqlDbType.NVarChar, 50).Value = (object)model.GioiTinh ?? DBNull.Value;

                connection.Open();
                command.ExecuteNonQuery();
            }

            return true;
        }

        public bool UpdateND(NguoiDung_Model model)
        {
            try
            {
                // Bypass the legacy stored procedure so Unicode values such as Vietnamese names
                // are always persisted through NVARCHAR parameters.
                return UpdateNDDirect(model);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private bool UpdateNDDirect(NguoiDung_Model model)
        {
            var databaseHelper = _dbHelper as DatabaseHelper;
            if (databaseHelper == null || string.IsNullOrWhiteSpace(databaseHelper.StrConnection))
            {
                throw new Exception("Không thể lấy chuỗi kết nối để cập nhật người dùng.");
            }

            using (var connection = new SqlConnection(databaseHelper.StrConnection))
            using (var command = connection.CreateCommand())
            {
                command.CommandType = CommandType.Text;
                command.CommandText = @"
UPDATE dbo.NguoiDung
SET TenND = @TenND,
    SinhNhat = @SinhNhat,
    DiaChi = @DiaChi,
    SDT = @SDT,
    Anh = @Anh,
    GioiTinh = @GioiTinh
WHERE MaND = @MaND;";

                command.Parameters.Add("@MaND", SqlDbType.Int).Value = model.MaND;
                command.Parameters.Add("@TenND", SqlDbType.NVarChar, 100).Value = (object)model.TenND ?? DBNull.Value;
                command.Parameters.Add("@SinhNhat", SqlDbType.Date).Value = (object)model.SinhNhat ?? DBNull.Value;
                command.Parameters.Add("@DiaChi", SqlDbType.NVarChar, 100).Value = (object)model.DiaChi ?? DBNull.Value;
                command.Parameters.Add("@SDT", SqlDbType.Int).Value = model.SDT;
                command.Parameters.Add("@Anh", SqlDbType.NVarChar, -1).Value = (object)model.Anh ?? DBNull.Value;
                command.Parameters.Add("@GioiTinh", SqlDbType.NVarChar, 50).Value = (object)model.GioiTinh ?? DBNull.Value;

                connection.Open();
                var affectedRows = command.ExecuteNonQuery();
                if (affectedRows <= 0)
                {
                    throw new Exception("Không tìm thấy người dùng cần cập nhật.");
                }
            }

            return true;
        }
        public bool DeleteND(string id)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out msgError, "xoa_nd",
                "@MaND", id);
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
        public List<NguoiDung_Model> SearchND(string TenND)
        {
            string msgError = "";
            try
            {
                var result = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_TimNguoiDung",
                    "@TenND", TenND);
                if (!string.IsNullOrEmpty(msgError.ToString()))
                {
                    throw new Exception(msgError.ToString());
                }
                return result.ConvertTo<NguoiDung_Model>().ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }
}
