CREATE DATABASE API_Dahla;
USE API_Dahla;
GO

--Tạo bảng
CREATE TABLE TaiKhoan(
MaTK INT PRIMARY KEY ,
TenTK NVARCHAR(100),
MatKhau VARCHAR(100),
Quyen NVARCHAR(50),
Email VARCHAR(100),
TrangThai NVARCHAR(100)
)
INSERT INTO TaiKhoan (MaTK, TenTK, MatKhau, Quyen, Email, TrangThai)
VALUES (1, N'admin', '123', N'Admin', 'gghg89949@gmail.com', N'Hoạt động'),
(2, N'user1', '456', 'User', 'nguyenvanA@gmail.com', N'Hoạt động'),
(3, N'user2', '456', 'User', 'nguyenvanB@gmail.com', N'Khoá'),
(4, N'user3', '456', 'User', 'nguyenvanC@gmail.com', N'Hoạt động');


CREATE TABLE NguoiDung(
MaND INT REFERENCES TaiKhoan(MaTK),
TenND NVARCHAR(100),
SinhNhat DATE,
DiaChi NVARCHAR(100),
SDT INT,
Anh NVARCHAR(MAX),
GioiTinh NVARCHAR(50),
PRIMARY KEY(MaND)
)
INSERT INTO NguoiDung(MaND, TenND, SinhNhat, DiaChi, SDT, Anh, GioiTinh)
VALUES (1, N'Đinh Thị Huyền Trang', 2004-11-29 , N'Hưng Yên', 364239807, 'avatar1.jpg' , N'Nữ'),
(2, N'Đinh Thiên Trường', 2004-09-21 , N'Hưng Yên', 819511666, 'avatar2.jpg' , N'Nam'),
(3, N'Đinh Công Phú', 2007-02-13 , N'Hưng Yên', 364239807, 'avatar1.jpg' , N'Nam'),
(4, N'Tạ Thị Nhã', 2004-12-01 , N'Bắc Ninh', 364239204, 'avatar1.jpg' , N'Nữ'),
(5, N'Lưu Hoài Thương', 2004-04-29 , N'Hà Nội', 364239807, 'avatar1.jpg' , N'Nữ')

CREATE TABLE DanhMucSP(
MaDanhMuc INT PRIMARY KEY,
TenDanhMuc NVARCHAR(50) 
)

CREATE TABLE Voucher(
Voucher_id INT PRIMARY KEY,
Voucher_name NVARCHAR(50),
GiaTien DECIMAL(10,2),
GiaToiThieu DECIMAL(10,2),
SLCon INT,
BatDau DATE ,
KetThuc DATE 
)
INSERT INTO Voucher (Voucher_id, Voucher_name, GiaTien, GiaToiThieu, SLCon, BatDau, KetThuc)
VALUES
    (1, 'Voucher 10%', 10, 100, 100, '2023-11-15', '2023-12-31'),
    (2, 'Voucher 20%', 20, 200, 50, '2023-11-15', '2024-01-31');


CREATE TABLE SanPham (
MaSanPham INT PRIMARY KEY,
TenSanPham NVARCHAR(100) ,
MoTaSP TEXT,
Gia DECIMAL(10,2),
AnhSP VARCHAR(255),
SL INT, --số lượng còn trong kho
MaDanhMuc INT FOREIGN KEY REFERENCES DanhMucSP(MaDanhMuc),
MaVoucher INT FOREIGN KEY REFERENCES Voucher(Voucher_id) NULL
)

CREATE TABLE GioHang(
MaSanPham INT REFERENCES SanPham(MaSanPham),
MaND INT REFERENCES NguoiDung(MaND),
SoLuong INT,
PRIMARY KEY(MaSanPham, MaND)
)


CREATE TABLE HoaDon(
MaHD INT PRIMARY KEY,	
NgayMua DATE,
TongTien DECIMAL(10,2),
TrangThai NVARCHAR(100),
DiaChiGiao NVARCHAR(100),
MaND INT FOREIGN KEY REFERENCES NguoiDung(MaND),
)

CREATE TABLE ChiTietHD(
MaChiTietHD INT PRIMARY KEY,
SLSP INT,
Gia DECIMAL(10,2),
SoTienGiam DECIMAL(10,2),
MaHD INT FOREIGN KEY REFERENCES HoaDon(MaHD),
MaSanPham INT FOREIGN KEY REFERENCES SanPham(MaSanPham),
MaVoucher INT FOREIGN KEY REFERENCES Voucher(Voucher_id) NULL
)


CREATE TABLE QC(
MaQC INT PRIMARY KEY,
TenQC NVARCHAR(50),
ViTri NVARCHAR(50),
NguoiGui NVARCHAR(50),
TimeTao TIMESTAMP ,
QCer INT FOREIGN KEY REFERENCES TaiKhoan(MaTK)
)

CREATE TABLE Feedback (
    FeedbackID INT PRIMARY KEY, 
    MaHD INT FOREIGN KEY REFERENCES HoaDon(MaHD), 
    MaND INT FOREIGN KEY REFERENCES NguoiDung(MaND), 
    NoiDung NVARCHAR(MAX),
    NgayTao DATETIME
)

--Procedure ThemSP
CREATE PROCEDURE [dbo].[them_sp]
(
    @MaSanPham INT,
    @TenSanPham NVARCHAR(100),
    @MoTaSP TEXT,
    @Gia DECIMAL(10,2),
    @AnhSP VARCHAR(255),
    @SL INT, --số lượng còn trong kho
    @MaDanhMuc INT,
    @MaVoucher INT = NULL -- Optional voucher
)
AS
BEGIN
    INSERT INTO SanPham (MaSanPham, TenSanPham, MoTaSP, Gia, AnhSP, SL, MaDanhMuc, MaVoucher)
    VALUES (@MaSanPham, @TenSanPham, @MoTaSP, @Gia, @AnhSP, @SL, @MaDanhMuc, @MaVoucher);
END


--Procedure SuaSP
CREATE PROCEDURE [dbo].[sua_sp]
    @MaSanPham INT,
    @TenSanPham NVARCHAR(100),
    @MoTaSP TEXT,
    @Gia DECIMAL(10,2),
    @AnhSP VARCHAR(255),
    @SL INT,
    @MaDanhMuc INT
AS
BEGIN
    UPDATE SanPham
    SET
        TenSanPham = @TenSanPham,
        MoTaSP = @MoTaSP,
        Gia = @Gia,
        AnhSP = @AnhSP,
        SL = @SL,
        MaDanhMuc = @MaDanhMuc
    WHERE MaSanPham = @MaSanPham;
END

--Xoá sp
CREATE PROCEDURE [dbo].[xoa_sp]
    @MaSanPham INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra xem sản phẩm có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM SanPham WHERE MaSanPham = @MaSanPham)
    BEGIN
        RAISERROR('Sản phẩm không tồn tại.', 16, 1);
        RETURN;
    END

    -- Bắt đầu giao dịch
    BEGIN TRANSACTION;

    -- Xóa sản phẩm
    DELETE FROM SanPham
    WHERE MaSanPham = @MaSanPham;

    -- Ghi nhật ký xóa sản phẩm (tùy chọn)
    INSERT INTO SanPhamLog (MaSanPham, HanhDong, ThucHienBoi, ThoiGian)
    VALUES (@MaSanPham, 'Xóa', CURRENT_USER, GETDATE());

    COMMIT TRANSACTION;
END

--Procedure Lấy thông tin bằng mã sản phẩm
CREATE PROCEDURE [dbo].[get_sp_id]
    @MaSanPham INT
AS
BEGIN
    SELECT
        MaSanPham,
        TenSanPham,
        MoTaSP,
        Gia,
        AnhSP,
        SL,
        MaDanhMuc,
		MaVoucher
    FROM SanPham
    WHERE MaSanPham = @MaSanPham;
END

--procedure xoá sp
CREATE PROCEDURE [dbo].[sp_delete_san_pham]
    @MaSanPham INT
AS
BEGIN
    DELETE FROM SanPham
    WHERE MaSanPham = @MaSanPham;
END
GO

--procedure get all date sp
CREATE PROCEDURE [dbo].[sp_san_pham_get_all]
AS
BEGIN
    SELECT MaSanPham, TenSanPham, MoTaSP, Gia, AnhSP, SL, MaDanhMuc, MaVoucher
    FROM SanPham;
END
GO


--procedure tìm sp
CREATE PROCEDURE sp_TimSanPham
    @TenSanPham NVARCHAR(100)
AS
BEGIN
    SELECT *
    FROM SanPham
    WHERE TenSanPham LIKE '%' + @TenSanPham + '%';
END

--procedure get_nguoidung_id
CREATE PROCEDURE [dbo].[nguoidung_get_id]
    @MaND INT
AS
BEGIN
    SELECT
        MaND,
        TenND,
        SinhNhat,
        DiaChi,
        SDT,
        Anh,
        GioiTinh
    FROM
        NguoiDung
    WHERE
        MaND = @MaND;
END
GO

--procedure them_nd
CREATE PROCEDURE [dbo].[them_nguoidung]
    @MaND INT,
    @TenND NVARCHAR(100),
    @SinhNhat DATE,
    @DiaChi NVARCHAR(100),
    @SDT INT,
    @Anh NVARCHAR(MAX),
    @GioiTinh NVARCHAR(50)
AS
BEGIN
    INSERT INTO NguoiDung
    (
        MaND,
        TenND,
        SinhNhat,
        DiaChi,
        SDT,
        Anh,
        GioiTinh
    )
    VALUES
    (
        @MaND,
        @TenND,
        @SinhNhat,
        @DiaChi,
        @SDT,
        @Anh,
        @GioiTinh
    );

    SELECT '';
END
GO

--procedure sua-nd
CREATE PROCEDURE [dbo].[sua_nd]
    @MaND INT,
    @TenND NVARCHAR(100),
    @SinhNhat DATE,
    @DiaChi NVARCHAR(100),
    @SDT INT,
    @Anh NVARCHAR(MAX),
    @GioiTinh NVARCHAR(50)
AS
BEGIN
    UPDATE NguoiDung
    SET
        TenND = @TenND,
        SinhNhat = @SinhNhat,
        DiaChi = @DiaChi,
        SDT = @SDT,
        Anh = @Anh,
        GioiTinh = @GioiTinh
    WHERE
        MaND = @MaND;

    SELECT '';
END
GO

--procedure xoa-nd
CREATE PROCEDURE [dbo].[xoa_nd]
    @MaND INT
AS
BEGIN
    DELETE FROM NguoiDung
    WHERE
        MaND = @MaND;

    SELECT '';
END
GO

--procedure tìm nd bằng tên
CREATE PROCEDURE sp_TimNguoiDung
    @TenND NVARCHAR(100)
AS
BEGIN
    SELECT *
    FROM NguoiDung
    WHERE TenND LIKE '%' + @TenND + '%';
END

--procedure get ell danh muc
CREATE PROCEDURE sp_LayTatCaDanhMuc
AS
BEGIN
    SELECT * FROM DanhMucSP;
END

--procedure tìm danh mục theo tên
CREATE PROCEDURE [dbo].[tim_danh_muc_theo_ten]
    @TenDanhMuc NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM DanhMucSP
    WHERE TenDanhMuc LIKE '%' + @TenDanhMuc + '%';
END




--procedure get ell taikhoan
CREATE PROCEDURE sp_LayTatCaTaiKhoan
AS
BEGIN
    SELECT * FROM TaiKhoan;
END

--procedure thêm tài khoản
CREATE PROCEDURE sp_ThemTK
    @MaTK INT,
    @TenTK NVARCHAR(100),
    @MatKhau VARCHAR(100),
    @Quyen NVARCHAR(50),
    @Email VARCHAR(100),
    @TrangThai NVARCHAR(100)
AS
BEGIN
    INSERT INTO TaiKhoan (MaTK, TenTK, MatKhau, Quyen, Email, TrangThai)
    VALUES (@MaTK, @TenTK, @MatKhau, @Quyen, @Email, @TrangThai)
END

--procedure sửa tài khoản
CREATE PROCEDURE sp_SuaTaiKhoan
    @MaTK INT,
    @TenTK NVARCHAR(100),
    @MatKhau VARCHAR(100),
    @Quyen NVARCHAR(50),
    @Email VARCHAR(100),
    @TrangThai NVARCHAR(100)
AS
BEGIN
    UPDATE TaiKhoan
    SET TenTK = @TenTK,
        MatKhau = @MatKhau,
        Quyen = @Quyen,
        Email = @Email,
        TrangThai = @TrangThai
    WHERE MaTK = @MaTK
END

--procedure xoá tài khoản
CREATE PROCEDURE sp_XoaTaiKhoan
    @MaTK INT
AS
BEGIN
    DELETE FROM TaiKhoan
    WHERE MaTK = @MaTK
END

--procedure tìm tk bằng tên
CREATE PROCEDURE sp_TimKiemTaiKhoan
    @TenTK NVARCHAR(100)
AS
BEGIN
    SELECT MaTK, TenTK, MatKhau, Quyen, Email, TrangThai
    FROM TaiKhoan
    WHERE TenTK LIKE '%' + @TenTK + '%'
END

--procedure thêm voucher
CREATE PROCEDURE sp_ThemVoucher
    @Voucher_name NVARCHAR(50),
    @GiaTien DECIMAL(10,2),
    @GiaToiThieu DECIMAL(10,2),
    @SLCon INT,
    @BatDau DATE,
    @KetThuc DATE
AS
BEGIN
    INSERT INTO Voucher (Voucher_name, GiaTien, GiaToiThieu, SLCon, BatDau, KetThuc)
    VALUES (@Voucher_name, @GiaTien, @GiaToiThieu, @SLCon, @BatDau, @KetThuc);
END

--procedure sửa voucher
CREATE PROCEDURE sp_SuaVoucher
    @Voucher_id INT,
    @Voucher_name NVARCHAR(50),
    @GiaTien DECIMAL(10,2),
    @GiaToiThieu DECIMAL(10,2),
    @SLCon INT,
    @BatDau DATE,
    @KetThuc DATE
AS
BEGIN
    UPDATE Voucher
    SET Voucher_name = @Voucher_name,
        GiaTien = @GiaTien,
        GiaToiThieu = @GiaToiThieu,
        SLCon = @SLCon,
        BatDau = @BatDau,
        KetThuc = @KetThuc
    WHERE Voucher_id = @Voucher_id;
END

--procedure xoá voucher
CREATE PROCEDURE sp_XoaVoucher
    @Voucher_id INT
AS
BEGIN
    DELETE FROM Voucher
    WHERE Voucher_id = @Voucher_id;
END

--procedure tìm voucher
CREATE PROCEDURE sp_TimVoucher
    @Voucher_name NVARCHAR(50)
AS
BEGIN
    SELECT *
    FROM Voucher
    WHERE Voucher_name LIKE '%' + @Voucher_name + '%';
END

--procedure lấy all voucher
CREATE PROCEDURE sp_LayTatCaVoucher
AS
BEGIN
    SELECT *
    FROM Voucher;
END

--procedure create hoa don
ALTER PROCEDURE sp_create
(@MaHD INT,
@NgayMua DATE,
    @TongTien DECIMAL(10, 2),
    @TrangThai NVARCHAR(100),
    @DiaChiGiao NVARCHAR(100),
    @MaND INT,
    @listjson_chitiet NVARCHAR(MAX)
)
AS
	BEGIN
		INSERT INTO HoaDon(
		MaHD,
		NgayMua,
        TongTien,
        TrangThai,
        DiaChiGiao,
        MaND
		)
		VALUES(
		@MaHD,
		@NgayMua,
        @TongTien,
        @TrangThai,
        @DiaChiGiao,
        @MaND
		);
		IF(@listjson_chitiet IS NOT NULL)
			BEGIN 
				INSERT INTO ChiTietHD(
				MaChiTietHD,
				MaHD,
				MaSanPham,
				SLSP,
				Gia,
				SoTienGiam,
				MaVoucher
				)
					SELECT JSON_VALUE(p.value, '$.MaChiTietHD'),
					@MaHD,
					JSON_VALUE(p.value, '$.MaSanPham'),
					JSON_VALUE(p.value, '$.SLSP'),
					JSON_VALUE(p.value, '$.Gia'),
					JSON_VALUE(p.value, '$.SoTienGiam'),
					JSON_VALUE(p.value, '$.MaVoucher')
					FROM OPENJSON (@listjson_chitiet) AS p;
		END;
	SELECT'';
	END;
GO

select * from HoaDon
select * from ChiTietHD


--xoá hoá đơn
create PROCEDURE sp_xoa
(@MaHD INT
)
AS
    BEGIN
		delete from ChiTietHD where MaHD = @MaHD;
		delete from HoaDon where MaHD = @MaHD;
        SELECT '';
    END;
GO

--get by id hoá đơn
create PROCEDURE sp_get_id
(@MaHD INT)
AS
    BEGIN
        SELECT h.MaHD, 
               h.NgayMua, 
               h.TongTien,
			   h.TrangThai,
			   h.DiaChiGiao,
			   h.MaND,
			   	(
					SELECT 
						c.MaChiTietHD,
						c.MaHD,
						i.MaSanPham,
						c.SLSP,
						c.Gia,
						c.SoTienGiam,
						c.MaVoucher
					FROM ChiTietHD AS c
					Join SanPham i on c.MaSanPham = i.MaSanPham
					WHERE c.MaHD = h.MaHD FOR JSON PATH
				) AS listjson_chitiet
        FROM HoaDon h
      where  h.MaHD = @MaHD;
    END;
GO

--tìm hoá đơn

--sửa hoá đơn




