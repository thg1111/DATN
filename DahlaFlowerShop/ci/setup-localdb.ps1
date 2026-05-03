param(
    [string]$InstanceName = "MSSQLLocalDB",
    [string]$ScriptPath = "",
    [switch]$RecreateDatabase
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ScriptPath)) {
    $ScriptPath = Join-Path $PSScriptRoot "sql\localdb-smoke.sql"
}

if (-not (Test-Path $ScriptPath)) {
    throw "SQL script not found: $ScriptPath"
}

sqllocaldb start $InstanceName | Out-Null

Add-Type -AssemblyName System.Data

function Invoke-SqlBatch {
    param(
        [string]$ConnectionString,
        [string]$Sql
    )

    $connection = New-Object System.Data.SqlClient.SqlConnection $ConnectionString
    try {
        $connection.Open()
        $command = $connection.CreateCommand()
        $command.CommandTimeout = 120
        $command.CommandText = $Sql
        [void]$command.ExecuteNonQuery()
    }
    finally {
        if ($connection.State -eq 'Open') {
            $connection.Close()
        }
    }
}

$masterConnection = "Data Source=(localdb)\$InstanceName;Initial Catalog=master;Integrated Security=True;TrustServerCertificate=True;"
$databaseConnection = "Data Source=(localdb)\$InstanceName;Initial Catalog=API_Dahla;Integrated Security=True;TrustServerCertificate=True;"

# Older versions of this script executed batches after USE API_Dahla against master
# because each GO batch opened a new connection. Remove only those known smoke
# objects so SQL Server does not resolve sp_ procedures from master.
Invoke-SqlBatch -ConnectionString $masterConnection -Sql @"
DECLARE @procedures TABLE (Name SYSNAME);
INSERT INTO @procedures (Name)
VALUES
    (N'sp_LayTatCaDanhMuc'),
    (N'tim_danh_muc_theo_ten'),
    (N'sp_ThemDanhMuc'),
    (N'them_sp'),
    (N'sua_sp'),
    (N'sp_san_pham_get_all'),
    (N'get_sp_id'),
    (N'sp_TimSanPham'),
    (N'sp_delete_san_pham'),
    (N'sp_LayTatCaTaiKhoan'),
    (N'sp_ThemTK'),
    (N'sp_SuaTaiKhoan'),
    (N'sp_XoaTaiKhoan'),
    (N'sp_TimKiemTaiKhoan'),
    (N'nguoidung_get_id'),
    (N'them_nguoidung'),
    (N'sua-nd'),
    (N'xoa_nd'),
    (N'sp_TimNguoiDung'),
    (N'sp_LayTatCaVoucher'),
    (N'sp_ThemVoucher'),
    (N'sp_SuaVoucher'),
    (N'sp_XoaVoucher'),
    (N'sp_TimVoucher'),
    (N'sp_create'),
    (N'sp_xoa'),
    (N'sp_get_id'),
    (N'sp_UpdateHoaDon'),
    (N'sp_SearchHoaDon'),
    (N'sp_LayTatCaDuLieuGioHang'),
    (N'sp_ThemSanPhamVaoGioHang'),
    (N'sp_SuaSoLuongSanPham'),
    (N'sp_XoaSanPhamKhoiGioHang'),
    (N'sp_GetAllFeedbacks'),
    (N'sp_InsertFeedback'),
    (N'sp_DeleteFeedback');

DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql = @sql + N'DROP PROCEDURE IF EXISTS dbo.' + QUOTENAME(Name) + N';'
FROM @procedures;
EXEC sp_executesql @sql;

DROP TABLE IF EXISTS dbo.Feedback;
DROP TABLE IF EXISTS dbo.GioHang;
DROP TABLE IF EXISTS dbo.ChiTietHD;
DROP TABLE IF EXISTS dbo.HoaDon;
DROP TABLE IF EXISTS dbo.SanPham;
DROP TABLE IF EXISTS dbo.NguoiDung;
DROP TABLE IF EXISTS dbo.Voucher;
DROP TABLE IF EXISTS dbo.DanhMucSP;
DROP TABLE IF EXISTS dbo.TaiKhoan;
"@

if ($RecreateDatabase) {
    Invoke-SqlBatch -ConnectionString $masterConnection -Sql @"
IF DB_ID(N'API_Dahla') IS NOT NULL
BEGIN
    ALTER DATABASE API_Dahla SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE API_Dahla;
END
"@
}

$content = Get-Content -Path $ScriptPath -Raw -Encoding UTF8
$batches = [System.Text.RegularExpressions.Regex]::Split($content, "(?im)^\s*GO\s*$")
$currentConnection = $masterConnection

foreach ($batch in $batches) {
    $sql = $batch.Trim()
    if (-not [string]::IsNullOrWhiteSpace($sql)) {
        if ($sql -match "(?im)^\s*USE\s+\[?API_Dahla\]?\s*;?\s*$") {
            $currentConnection = $databaseConnection
            continue
        }

        Invoke-SqlBatch -ConnectionString $currentConnection -Sql $sql
    }
}

Write-Host "LocalDB smoke schema is ready on instance $InstanceName"
