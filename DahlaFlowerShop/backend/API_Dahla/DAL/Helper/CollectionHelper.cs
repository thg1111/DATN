using Newtonsoft.Json.Serialization;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;
using System.Data;
using System.Reflection;

namespace DAL.Helper
{
    public static class MessageConvert
    {
        private static readonly JsonSerializerSettings Settings;
        static MessageConvert()
        {
            Settings = new JsonSerializerSettings
            {
                Formatting = Formatting.None,
                DateFormatHandling = DateFormatHandling.IsoDateFormat,
                NullValueHandling = NullValueHandling.Ignore,
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
        }

        public static string SerializeObject(this object obj)
        {
            if (obj == null)
                return "";
            return JsonConvert.SerializeObject(obj, Settings);
        }

        public static T DeserializeObject<T>(this string json)
        {

            return JsonConvert.DeserializeObject<T>(json, Settings);

        }

        public static Object DeserializeObject(this string json, Type type)
        {
            try
            {
                return JsonConvert.DeserializeObject(json, type, Settings);
            }
            catch
            {
                return null;
            }
        }
    }
    public static class CollectionHelper //
    {
        private static string GetExcelColumnName(int columnNumber)
        {
            int dividend = columnNumber;
            string columnName = String.Empty;
            int modulo;

            while (dividend > 0)//chuyển số cột thành chữ cái tương ứng
            {
                modulo = (dividend - 1) % 26;
                columnName = Convert.ToChar(65 + modulo).ToString() + columnName;
                dividend = (int)((dividend - modulo) / 26);
            }
            return columnName;
        }
        public static object GetPropertyValue(this object T, string propName)// lấy thông tin và giá trị thuộc tính
        {
            return T.GetType().GetProperty(propName) == null ? null : T.GetType().GetProperty(propName).GetValue(T, null);
        }
        public static string GetPropertyValueToString(this object T, string propName)//lấy giá trị sau đó chuyển đổi thành chuỗi
        {
            return T.GetType().GetProperty(propName) == null ? "" : Convert.ToString(T.GetType().GetProperty(propName).GetValue(T, null));
        }
        public static List<T> GetSourceWithPaging<T>(IEnumerable<T> source, int pageSize, int pageIndex, ref int totalPage)
        {
            var enumerable = source as T[] ?? source.ToArray();
            int totalRow = enumerable.Count();
            totalPage = totalRow % pageSize == 0 ? totalRow / pageSize : (totalRow / pageSize) + 1;//tính số trang cần thiết dựa vào kthuoc trang và tổng số dòng
            int skip = (pageIndex - 1) * pageSize;
            var rows = enumerable.Skip(skip).Take(pageSize);//lấy ra các phần tử t/u với trang được ycau
            return rows.ToList();
        }

        public static DataTable ConvertTo<T>(this IList<T> list)//chuyển đổi danh sách các object sang bảng dữ liệu
        {
            DataTable table = CreateTable<T>();
            Type entityType = typeof(T);
            PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(entityType);

            foreach (T item in list)
            {
                DataRow row = table.NewRow();

                foreach (PropertyDescriptor prop in properties)
                {
                    row[prop.Name] = prop.GetValue(item);
                }

                table.Rows.Add(row);
            }

            return table;
        }
        public static IList<T> ConvertTo<T>(IList<DataRow> rows)//chuyển đổi ds các dòng dữ liệu sang 1 ds các object
        {
            IList<T> list = null;

            if (rows != null)
            {
                list = new List<T>();

                foreach (DataRow row in rows)
                {
                    T item = CreateItem<T>(row);
                    list.Add(item);
                }
            }

            return list;
        }
        public static IList<T> ConvertTo<T>(this DataTable table)//chuyển đổi bảng dữ liệu sang ds
        {
            if (table == null)
            {
                return null;
            }

            var rows = new List<DataRow>();

            foreach (DataRow row in table.Rows)
            {
                rows.Add(row);
            }

            return ConvertTo<T>(rows);
        }
        public static T CreateItem<T>(DataRow row)
        {
            T obj = default(T);
            if (row != null)
            {
                obj = Activator.CreateInstance<T>();
                foreach (DataColumn column in row.Table.Columns)
                {
                    PropertyInfo prop = obj.GetType().GetProperty(column.ColumnName);
                    if (prop == null) continue;
                    Type type = prop.PropertyType;
                    try
                    {
                        object value = row[column.ColumnName];
                        if (value != DBNull.Value)
                        {
                            if (column.ColumnName.Contains("json"))
                            {
                                prop.SetValue(obj, MessageConvert.DeserializeObject(("" + value).Replace("$", ""), type), null);
                            }
                            else if (type.Name == "String")
                            {
                                prop.SetValue(obj, Convert.ToString(value), null);
                            }
                            else if (type.Name == "Single")
                            {
                                prop.SetValue(obj, Convert.ToSingle(value), null);
                            }
                            else if (type.Name == "Nullable`1" || type.Name == "DateTime")
                            {
                                var t = Nullable.GetUnderlyingType(type) ?? type;
                                var safeValue = (value == null) ? null : Convert.ChangeType(value, t);
                                prop.SetValue(obj, safeValue, null);
                            }
                            else
                            {
                                prop.SetValue(obj, value, null);
                            }
                        }
                    }
                    catch
                    {
                        // You can log something here
                        throw;
                    }
                }
            }

            return obj;
        }
        public static DataTable CreateTable<T>()
        {
            Type entityType = typeof(T);
            var table = new DataTable(entityType.Name);
            PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(entityType);

            foreach (PropertyDescriptor prop in properties)
            {
                table.Columns.Add(prop.Name, prop.PropertyType);
            }

            return table;
        }
    }
}
