IF DB_ID(N'API_Dahla') IS NULL
BEGIN
    CREATE DATABASE API_Dahla;
END
GO

USE API_Dahla;
GO

IF OBJECT_ID(N'dbo.Feedback', N'U') IS NOT NULL
    DELETE FROM dbo.Feedback WHERE FeedbackID BETWEEN 9900 AND 9999;
IF OBJECT_ID(N'dbo.GioHang', N'U') IS NOT NULL
    DELETE FROM dbo.GioHang WHERE MaSanPham BETWEEN 9900 AND 9999 OR MaND BETWEEN 9900 AND 9999;
IF OBJECT_ID(N'dbo.ChiTietHD', N'U') IS NOT NULL
    DELETE FROM dbo.ChiTietHD WHERE MaChiTietHD BETWEEN 9900 AND 9999 OR MaHD BETWEEN 9900 AND 9999;
IF OBJECT_ID(N'dbo.HoaDon', N'U') IS NOT NULL
    DELETE FROM dbo.HoaDon WHERE MaHD BETWEEN 9900 AND 9999;
IF OBJECT_ID(N'dbo.SanPham', N'U') IS NOT NULL
    DELETE FROM dbo.SanPham WHERE MaSanPham BETWEEN 9900 AND 9999;
IF OBJECT_ID(N'dbo.NguoiDung', N'U') IS NOT NULL
    DELETE FROM dbo.NguoiDung WHERE MaND BETWEEN 9900 AND 9999;
IF OBJECT_ID(N'dbo.TaiKhoan', N'U') IS NOT NULL
    DELETE FROM dbo.TaiKhoan WHERE MaTK BETWEEN 9900 AND 9999;
IF OBJECT_ID(N'dbo.Voucher', N'U') IS NOT NULL
    DELETE FROM dbo.Voucher WHERE Voucher_id BETWEEN 9900 AND 9999;
IF OBJECT_ID(N'dbo.DanhMucSP', N'U') IS NOT NULL
    DELETE FROM dbo.DanhMucSP WHERE MaDanhMuc BETWEEN 9900 AND 9999;
GO

IF OBJECT_ID(N'dbo.TaiKhoan', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TaiKhoan
    (
        MaTK INT NOT NULL PRIMARY KEY,
        TenTK NVARCHAR(100) NOT NULL,
        MatKhau NVARCHAR(100) NOT NULL,
        Quyen NVARCHAR(50) NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        TrangThai NVARCHAR(100) NOT NULL
    );
END
GO

IF OBJECT_ID(N'dbo.NguoiDung', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.NguoiDung
    (
        MaND INT NOT NULL PRIMARY KEY,
        TenND NVARCHAR(100) NOT NULL,
        SinhNhat DATE NULL,
        DiaChi NVARCHAR(100) NULL,
        SDT INT NULL,
        Anh NVARCHAR(MAX) NULL,
        GioiTinh NVARCHAR(50) NULL,
        CONSTRAINT FK_NguoiDung_TaiKhoan FOREIGN KEY (MaND) REFERENCES dbo.TaiKhoan(MaTK)
    );
END
GO

IF OBJECT_ID(N'dbo.DanhMucSP', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DanhMucSP
    (
        MaDanhMuc INT NOT NULL PRIMARY KEY,
        TenDanhMuc NVARCHAR(50) NOT NULL
    );
END
GO

IF OBJECT_ID(N'dbo.Voucher', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Voucher
    (
        Voucher_id INT NOT NULL PRIMARY KEY,
        Voucher_name NVARCHAR(50) NOT NULL,
        GiaTien DECIMAL(10, 2) NULL,
        GiaToiThieu DECIMAL(10, 2) NULL,
        SLCon INT NOT NULL,
        BatDau DATE NULL,
        KetThuc DATE NULL
    );
END
GO

IF OBJECT_ID(N'dbo.SanPham', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SanPham
    (
        MaSanPham INT NOT NULL PRIMARY KEY,
        TenSanPham NVARCHAR(100) NOT NULL,
        MoTaSP NVARCHAR(MAX) NULL,
        Gia DECIMAL(10, 2) NULL,
        AnhSP NVARCHAR(255) NULL,
        SL INT NOT NULL,
        MaDanhMuc INT NOT NULL,
        MaVoucher INT NULL,
        CONSTRAINT FK_SanPham_DanhMuc FOREIGN KEY (MaDanhMuc) REFERENCES dbo.DanhMucSP(MaDanhMuc),
        CONSTRAINT FK_SanPham_Voucher FOREIGN KEY (MaVoucher) REFERENCES dbo.Voucher(Voucher_id)
    );
END
GO

IF OBJECT_ID(N'dbo.HoaDon', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.HoaDon
    (
        MaHD INT NOT NULL PRIMARY KEY,
        NgayMua DATE NULL,
        TongTien DECIMAL(10, 2) NOT NULL,
        TrangThai NVARCHAR(100) NOT NULL,
        DiaChiGiao NVARCHAR(100) NULL,
        MaND INT NOT NULL,
        CONSTRAINT FK_HoaDon_NguoiDung FOREIGN KEY (MaND) REFERENCES dbo.NguoiDung(MaND)
    );
END
GO

IF OBJECT_ID(N'dbo.ChiTietHD', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ChiTietHD
    (
        MaChiTietHD INT NOT NULL PRIMARY KEY,
        SLSP INT NOT NULL,
        Gia DECIMAL(10, 2) NOT NULL,
        SoTienGiam DECIMAL(10, 2) NOT NULL,
        MaHD INT NOT NULL,
        MaSanPham INT NOT NULL,
        MaVoucher INT NULL,
        CONSTRAINT FK_ChiTietHD_HoaDon FOREIGN KEY (MaHD) REFERENCES dbo.HoaDon(MaHD),
        CONSTRAINT FK_ChiTietHD_SanPham FOREIGN KEY (MaSanPham) REFERENCES dbo.SanPham(MaSanPham),
        CONSTRAINT FK_ChiTietHD_Voucher FOREIGN KEY (MaVoucher) REFERENCES dbo.Voucher(Voucher_id)
    );
END
GO

IF OBJECT_ID(N'dbo.GioHang', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.GioHang
    (
        MaSanPham INT NOT NULL,
        MaND INT NOT NULL,
        SoLuong INT NOT NULL,
        CONSTRAINT PK_GioHang PRIMARY KEY (MaSanPham, MaND),
        CONSTRAINT FK_GioHang_SanPham FOREIGN KEY (MaSanPham) REFERENCES dbo.SanPham(MaSanPham),
        CONSTRAINT FK_GioHang_NguoiDung FOREIGN KEY (MaND) REFERENCES dbo.NguoiDung(MaND)
    );
END
GO

IF OBJECT_ID(N'dbo.Feedback', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Feedback
    (
        FeedbackID INT NOT NULL PRIMARY KEY,
        MaHD INT NOT NULL,
        MaND INT NOT NULL,
        NoiDung NVARCHAR(MAX) NULL,
        NgayTao DATETIME NULL,
        CONSTRAINT FK_Feedback_HoaDon FOREIGN KEY (MaHD) REFERENCES dbo.HoaDon(MaHD),
        CONSTRAINT FK_Feedback_NguoiDung FOREIGN KEY (MaND) REFERENCES dbo.NguoiDung(MaND)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE MaTK = 1)
    INSERT INTO dbo.TaiKhoan (MaTK, TenTK, MatKhau, Quyen, Email, TrangThai)
    VALUES (1, N'admin', N'123', N'Admin', N'admin@dahla.local', N'Hoạt động');

IF NOT EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE MaTK = 2)
    INSERT INTO dbo.TaiKhoan (MaTK, TenTK, MatKhau, Quyen, Email, TrangThai)
    VALUES (2, N'user1', N'456', N'User', N'user1@dahla.local', N'Hoạt động');

IF NOT EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE MaTK = 3)
    INSERT INTO dbo.TaiKhoan (MaTK, TenTK, MatKhau, Quyen, Email, TrangThai)
    VALUES (3, N'user2', N'456', N'User', N'user2@dahla.local', N'Khoá');

IF NOT EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE MaTK = 4)
    INSERT INTO dbo.TaiKhoan (MaTK, TenTK, MatKhau, Quyen, Email, TrangThai)
    VALUES (4, N'user3', N'456', N'User', N'user3@dahla.local', N'Hoạt động');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.NguoiDung WHERE MaND = 1)
    INSERT INTO dbo.NguoiDung (MaND, TenND, SinhNhat, DiaChi, SDT, Anh, GioiTinh)
    VALUES (1, N'Đinh Thị Huyền Trang', '2004-11-29', N'Hưng Yên', 364239807, N'avatar1.jpg', N'Nữ');

IF NOT EXISTS (SELECT 1 FROM dbo.NguoiDung WHERE MaND = 2)
    INSERT INTO dbo.NguoiDung (MaND, TenND, SinhNhat, DiaChi, SDT, Anh, GioiTinh)
    VALUES (2, N'Đinh Thiên Trường', '2004-09-21', N'Hưng Yên', 819511666, N'avatar2.jpg', N'Nam');

IF NOT EXISTS (SELECT 1 FROM dbo.NguoiDung WHERE MaND = 3)
    INSERT INTO dbo.NguoiDung (MaND, TenND, SinhNhat, DiaChi, SDT, Anh, GioiTinh)
    VALUES (3, N'Đinh Công Phú', '2007-02-13', N'Hưng Yên', 364239808, N'avatar3.jpg', N'Nam');

IF NOT EXISTS (SELECT 1 FROM dbo.NguoiDung WHERE MaND = 4)
    INSERT INTO dbo.NguoiDung (MaND, TenND, SinhNhat, DiaChi, SDT, Anh, GioiTinh)
    VALUES (4, N'Tạ Thị Nhã', '2004-12-01', N'Bắc Ninh', 364239204, N'avatar4.jpg', N'Nữ');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DanhMucSP WHERE MaDanhMuc = 1)
    INSERT INTO dbo.DanhMucSP (MaDanhMuc, TenDanhMuc) VALUES (1, N'Valentine');
IF NOT EXISTS (SELECT 1 FROM dbo.DanhMucSP WHERE MaDanhMuc = 2)
    INSERT INTO dbo.DanhMucSP (MaDanhMuc, TenDanhMuc) VALUES (2, N'Gấu bông');
IF NOT EXISTS (SELECT 1 FROM dbo.DanhMucSP WHERE MaDanhMuc = 3)
    INSERT INTO dbo.DanhMucSP (MaDanhMuc, TenDanhMuc) VALUES (3, N'Hoa sinh nhật');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Voucher WHERE Voucher_id = 1)
    INSERT INTO dbo.Voucher (Voucher_id, Voucher_name, GiaTien, GiaToiThieu, SLCon, BatDau, KetThuc)
    VALUES (1, N'Voucher 10%', 10, 100, 100, '2026-01-01', '2026-12-31');

IF NOT EXISTS (SELECT 1 FROM dbo.Voucher WHERE Voucher_id = 2)
    INSERT INTO dbo.Voucher (Voucher_id, Voucher_name, GiaTien, GiaToiThieu, SLCon, BatDau, KetThuc)
    VALUES (2, N'Voucher 20%', 20, 200, 50, '2026-01-01', '2026-12-31');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.SanPham WHERE MaSanPham = 101)
    INSERT INTO dbo.SanPham (MaSanPham, TenSanPham, MoTaSP, Gia, AnhSP, SL, MaDanhMuc, MaVoucher)
    VALUES (101, N'Hoa hồng đỏ', N'Bó hoa hồng đỏ cho dịp Valentine', 350000, N'hoa-hong-do.jpg', 20, 1, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.SanPham WHERE MaSanPham = 102)
    INSERT INTO dbo.SanPham (MaSanPham, TenSanPham, MoTaSP, Gia, AnhSP, SL, MaDanhMuc, MaVoucher)
    VALUES (102, N'Gấu bông Teddy', N'Gấu bông quà tặng dễ thương', 220000, N'teddy-bear.jpg', 15, 2, NULL);

IF NOT EXISTS (SELECT 1 FROM dbo.SanPham WHERE MaSanPham = 103)
    INSERT INTO dbo.SanPham (MaSanPham, TenSanPham, MoTaSP, Gia, AnhSP, SL, MaDanhMuc, MaVoucher)
    VALUES (103, N'Hoa sinh nhật pastel', N'Lẵng hoa sinh nhật tông pastel', 480000, N'hoa-sinh-nhat.jpg', 12, 3, 2);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.HoaDon WHERE MaHD = 9001)
    INSERT INTO dbo.HoaDon (MaHD, NgayMua, TongTien, TrangThai, DiaChiGiao, MaND)
    VALUES (9001, '2026-04-01', 350000, N'Đang chờ', N'Hưng Yên', 1);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.ChiTietHD WHERE MaChiTietHD = 9101)
    INSERT INTO dbo.ChiTietHD (MaChiTietHD, SLSP, Gia, SoTienGiam, MaHD, MaSanPham, MaVoucher)
    VALUES (9101, 1, 350000, 0, 9001, 101, 1);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.GioHang WHERE MaSanPham = 101 AND MaND = 1)
    INSERT INTO dbo.GioHang (MaSanPham, MaND, SoLuong)
    VALUES (101, 1, 2);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Feedback WHERE FeedbackID = 1)
    INSERT INTO dbo.Feedback (FeedbackID, MaHD, MaND, NoiDung, NgayTao)
    VALUES (1, 9001, 1, N'Hoa đẹp, giao đúng giờ.', '2026-04-02T10:30:00');
GO

CREATE OR ALTER PROCEDURE dbo.sp_LayTatCaDanhMuc
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaDanhMuc, TenDanhMuc
    FROM dbo.DanhMucSP
    ORDER BY MaDanhMuc;
END
GO

CREATE OR ALTER PROCEDURE dbo.tim_danh_muc_theo_ten
    @TenDanhMuc NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaDanhMuc, TenDanhMuc
    FROM dbo.DanhMucSP
    WHERE TenDanhMuc LIKE N'%' + @TenDanhMuc + N'%'
    ORDER BY MaDanhMuc;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ThemDanhMuc
    @MaDanhMuc INT,
    @TenDanhMuc NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.DanhMucSP (MaDanhMuc, TenDanhMuc)
    VALUES (@MaDanhMuc, @TenDanhMuc);
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.them_sp
    @MaSanPham INT,
    @TenSanPham NVARCHAR(100),
    @MaDanhMuc INT,
    @MoTaSP NVARCHAR(MAX),
    @Gia DECIMAL(10, 2),
    @AnhSP NVARCHAR(255),
    @SL INT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.SanPham (MaSanPham, TenSanPham, MoTaSP, Gia, AnhSP, SL, MaDanhMuc, MaVoucher)
    VALUES (@MaSanPham, @TenSanPham, @MoTaSP, @Gia, @AnhSP, @SL, @MaDanhMuc, NULL);
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sua_sp
    @MaSanPham INT,
    @TenSanPham NVARCHAR(100),
    @MaDanhMuc INT,
    @MoTaSP NVARCHAR(MAX),
    @Gia DECIMAL(10, 2),
    @AnhSP NVARCHAR(255),
    @SL INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.SanPham
    SET TenSanPham = @TenSanPham,
        MoTaSP = @MoTaSP,
        Gia = @Gia,
        AnhSP = @AnhSP,
        SL = @SL,
        MaDanhMuc = @MaDanhMuc
    WHERE MaSanPham = @MaSanPham;
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_san_pham_get_all
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaSanPham, TenSanPham, MaDanhMuc, MoTaSP, Gia, AnhSP, SL
    FROM dbo.SanPham
    ORDER BY MaSanPham;
END
GO

CREATE OR ALTER PROCEDURE dbo.get_sp_id
    @MaSanPham INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaSanPham, TenSanPham, MaDanhMuc, MoTaSP, Gia, AnhSP, SL
    FROM dbo.SanPham
    WHERE MaSanPham = @MaSanPham;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_TimSanPham
    @TenSanPham NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaSanPham, TenSanPham, MaDanhMuc, MoTaSP, Gia, AnhSP, SL
    FROM dbo.SanPham
    WHERE TenSanPham LIKE N'%' + @TenSanPham + N'%'
    ORDER BY MaSanPham;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_delete_san_pham
    @MaSanPham INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.SanPham WHERE MaSanPham = @MaSanPham;
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_LayTatCaTaiKhoan
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaTK, TenTK, MatKhau, Quyen, Email, TrangThai
    FROM dbo.TaiKhoan
    ORDER BY MaTK;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ThemTK
    @MaTK INT,
    @TenTK NVARCHAR(100),
    @MatKhau NVARCHAR(100),
    @Quyen NVARCHAR(50),
    @Email NVARCHAR(100),
    @TrangThai NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.TaiKhoan (MaTK, TenTK, MatKhau, Quyen, Email, TrangThai)
    VALUES (@MaTK, @TenTK, @MatKhau, @Quyen, @Email, @TrangThai);
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SuaTaiKhoan
    @MaTK INT,
    @TenTK NVARCHAR(100),
    @MatKhau NVARCHAR(100),
    @Quyen NVARCHAR(50),
    @Email NVARCHAR(100),
    @TrangThai NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.TaiKhoan
    SET TenTK = @TenTK,
        MatKhau = @MatKhau,
        Quyen = @Quyen,
        Email = @Email,
        TrangThai = @TrangThai
    WHERE MaTK = @MaTK;
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_XoaTaiKhoan
    @MaTK INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.TaiKhoan WHERE MaTK = @MaTK;
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_TimKiemTaiKhoan
    @TenTK NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaTK, TenTK, MatKhau, Quyen, Email, TrangThai
    FROM dbo.TaiKhoan
    WHERE TenTK LIKE N'%' + @TenTK + N'%'
    ORDER BY MaTK;
END
GO

CREATE OR ALTER PROCEDURE dbo.nguoidung_get_id
    @MaND INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaND, TenND, SinhNhat, DiaChi, SDT, Anh, GioiTinh
    FROM dbo.NguoiDung
    WHERE MaND = @MaND;
END
GO

CREATE OR ALTER PROCEDURE dbo.them_nguoidung
    @MaND INT,
    @TenND NVARCHAR(100),
    @SinhNhat DATE,
    @DiaChi NVARCHAR(100),
    @SDT INT,
    @Anh NVARCHAR(MAX),
    @GioiTinh NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.NguoiDung (MaND, TenND, SinhNhat, DiaChi, SDT, Anh, GioiTinh)
    VALUES (@MaND, @TenND, @SinhNhat, @DiaChi, @SDT, @Anh, @GioiTinh);
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.[sua-nd]
    @MaND INT,
    @TenND NVARCHAR(100),
    @SinhNhat DATE,
    @DiaChi NVARCHAR(100),
    @SDT INT,
    @Anh NVARCHAR(MAX),
    @GioiTinh NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.NguoiDung
    SET TenND = @TenND,
        SinhNhat = @SinhNhat,
        DiaChi = @DiaChi,
        SDT = @SDT,
        Anh = @Anh,
        GioiTinh = @GioiTinh
    WHERE MaND = @MaND;
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.xoa_nd
    @MaND INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.NguoiDung WHERE MaND = @MaND;
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_TimNguoiDung
    @TenND NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaND, TenND, SinhNhat, DiaChi, SDT, Anh, GioiTinh
    FROM dbo.NguoiDung
    WHERE TenND LIKE N'%' + @TenND + N'%'
    ORDER BY MaND;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_LayTatCaVoucher
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Voucher_id, Voucher_name, GiaTien, GiaToiThieu, SLCon, BatDau, KetThuc
    FROM dbo.Voucher
    ORDER BY Voucher_id;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ThemVoucher
    @Voucher_id INT,
    @Voucher_name NVARCHAR(50),
    @GiaTien DECIMAL(10, 2),
    @GiaToiThieu DECIMAL(10, 2),
    @SLCon INT,
    @BatDau DATE,
    @KetThuc DATE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Voucher (Voucher_id, Voucher_name, GiaTien, GiaToiThieu, SLCon, BatDau, KetThuc)
    VALUES (@Voucher_id, @Voucher_name, @GiaTien, @GiaToiThieu, @SLCon, @BatDau, @KetThuc);
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SuaVoucher
    @Voucher_id INT,
    @Voucher_name NVARCHAR(50),
    @GiaTien DECIMAL(10, 2),
    @GiaToiThieu DECIMAL(10, 2),
    @SLCon INT,
    @BatDau DATE,
    @KetThuc DATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Voucher
    SET Voucher_name = @Voucher_name,
        GiaTien = @GiaTien,
        GiaToiThieu = @GiaToiThieu,
        SLCon = @SLCon,
        BatDau = @BatDau,
        KetThuc = @KetThuc
    WHERE Voucher_id = @Voucher_id;
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_XoaVoucher
    @Voucher_id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.Voucher WHERE Voucher_id = @Voucher_id;
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_TimVoucher
    @Voucher_id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Voucher_id, Voucher_name, GiaTien, GiaToiThieu, SLCon, BatDau, KetThuc
    FROM dbo.Voucher
    WHERE Voucher_name LIKE N'%' + @Voucher_id + N'%'
       OR CONVERT(NVARCHAR(50), Voucher_id) LIKE N'%' + @Voucher_id + N'%'
    ORDER BY Voucher_id;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_create
    @MaHD INT,
    @NgayMua DATE,
    @TongTien DECIMAL(10, 2),
    @TrangThai NVARCHAR(100),
    @DiaChiGiao NVARCHAR(100),
    @MaND INT,
    @listjson_chitiet NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.HoaDon (MaHD, NgayMua, TongTien, TrangThai, DiaChiGiao, MaND)
    VALUES (@MaHD, @NgayMua, @TongTien, @TrangThai, @DiaChiGiao, @MaND);

    IF (@listjson_chitiet IS NOT NULL)
    BEGIN
        INSERT INTO dbo.ChiTietHD (MaChiTietHD, SLSP, Gia, SoTienGiam, MaHD, MaSanPham, MaVoucher)
        SELECT
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.MaChiTietHD'), JSON_VALUE(p.value, '$.maChiTietHD')) AS INT),
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.SLSP'), JSON_VALUE(p.value, '$.slsp')) AS INT),
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.Gia'), JSON_VALUE(p.value, '$.gia')) AS DECIMAL(10, 2)),
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.SoTienGiam'), JSON_VALUE(p.value, '$.soTienGiam')) AS DECIMAL(10, 2)),
            @MaHD,
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.MaSanPham'), JSON_VALUE(p.value, '$.maSanPham')) AS INT),
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.MaVoucher'), JSON_VALUE(p.value, '$.maVoucher')) AS INT)
        FROM OPENJSON(@listjson_chitiet) AS p;
    END

    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_xoa
    @MaHD INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.ChiTietHD WHERE MaHD = @MaHD;
    DELETE FROM dbo.HoaDon WHERE MaHD = @MaHD;
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_get_id
    @MaHD INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        h.MaHD,
        h.NgayMua,
        h.TongTien,
        h.TrangThai,
        h.DiaChiGiao,
        h.MaND,
        (
            SELECT
                c.MaChiTietHD,
                c.MaHD,
                c.MaSanPham,
                c.SLSP,
                c.Gia,
                c.SoTienGiam,
                c.MaVoucher
            FROM dbo.ChiTietHD AS c
            WHERE c.MaHD = h.MaHD
            FOR JSON PATH
        ) AS listjson_chitiet
    FROM dbo.HoaDon AS h
    WHERE h.MaHD = @MaHD;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_UpdateHoaDon
    @MaHD INT,
    @NgayMua DATE,
    @TongTien DECIMAL(10, 2),
    @TrangThai NVARCHAR(100),
    @DiaChiGiao NVARCHAR(100),
    @MaND INT,
    @listjson_chitiet NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.HoaDon
    SET NgayMua = @NgayMua,
        TongTien = @TongTien,
        TrangThai = @TrangThai,
        DiaChiGiao = @DiaChiGiao,
        MaND = @MaND
    WHERE MaHD = @MaHD;

    DELETE FROM dbo.ChiTietHD WHERE MaHD = @MaHD;

    IF (@listjson_chitiet IS NOT NULL)
    BEGIN
        INSERT INTO dbo.ChiTietHD (MaChiTietHD, SLSP, Gia, SoTienGiam, MaHD, MaSanPham, MaVoucher)
        SELECT
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.MaChiTietHD'), JSON_VALUE(p.value, '$.maChiTietHD')) AS INT),
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.SLSP'), JSON_VALUE(p.value, '$.slsp')) AS INT),
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.Gia'), JSON_VALUE(p.value, '$.gia')) AS DECIMAL(10, 2)),
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.SoTienGiam'), JSON_VALUE(p.value, '$.soTienGiam')) AS DECIMAL(10, 2)),
            @MaHD,
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.MaSanPham'), JSON_VALUE(p.value, '$.maSanPham')) AS INT),
            TRY_CAST(COALESCE(JSON_VALUE(p.value, '$.MaVoucher'), JSON_VALUE(p.value, '$.maVoucher')) AS INT)
        FROM OPENJSON(@listjson_chitiet) AS p;
    END

    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SearchHoaDon
    @page_index INT,
    @page_size INT,
    @NgayMua NVARCHAR(50),
    @DiaChiGiao NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH Filtered AS
    (
        SELECT
            h.MaHD,
            h.NgayMua,
            h.TongTien,
            h.TrangThai,
            h.DiaChiGiao,
            h.MaND
        FROM dbo.HoaDon AS h
        WHERE (@NgayMua IS NULL OR @NgayMua = '' OR CONVERT(NVARCHAR(10), h.NgayMua, 23) = @NgayMua)
          AND (@DiaChiGiao IS NULL OR @DiaChiGiao = '' OR h.DiaChiGiao LIKE N'%' + @DiaChiGiao + N'%')
    )
    SELECT
        *,
        COUNT(1) OVER() AS RecordCount
    FROM Filtered
    ORDER BY MaHD DESC
    OFFSET (@page_index - 1) * @page_size ROWS
    FETCH NEXT @page_size ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_LayTatCaDuLieuGioHang
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaSanPham, MaND, SoLuong
    FROM dbo.GioHang
    ORDER BY MaND, MaSanPham;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ThemSanPhamVaoGioHang
    @MaSanPham INT,
    @MaND INT,
    @SoLuong INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.GioHang WHERE MaSanPham = @MaSanPham AND MaND = @MaND)
    BEGIN
        UPDATE dbo.GioHang
        SET SoLuong = SoLuong + @SoLuong
        WHERE MaSanPham = @MaSanPham AND MaND = @MaND;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.GioHang (MaSanPham, MaND, SoLuong)
        VALUES (@MaSanPham, @MaND, @SoLuong);
    END

    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SuaSoLuongSanPham
    @SoLuong INT,
    @MaSanPham INT,
    @MaND INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.GioHang
    SET SoLuong = @SoLuong
    WHERE MaSanPham = @MaSanPham AND MaND = @MaND;
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_XoaSanPhamKhoiGioHang
    @MaSanPham INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.GioHang WHERE MaSanPham = @MaSanPham;
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetAllFeedbacks
AS
BEGIN
    SET NOCOUNT ON;
    SELECT FeedbackID, MaHD, MaND, NoiDung, NgayTao
    FROM dbo.Feedback
    ORDER BY FeedbackID;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_InsertFeedback
    @FeedbackID INT,
    @MaHD INT,
    @MaND INT,
    @NoiDung NVARCHAR(MAX),
    @NgayTao DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Feedback (FeedbackID, MaHD, MaND, NoiDung, NgayTao)
    VALUES (@FeedbackID, @MaHD, @MaND, @NoiDung, @NgayTao);
    SELECT '';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_DeleteFeedback
    @FeedbackID INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.Feedback WHERE FeedbackID = @FeedbackID;
    SELECT '';
END
GO
