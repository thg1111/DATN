var apiUrl = typeof buildApiUrl === 'function'
    ? buildApiUrl
    : function (path) {
        var baseUrl = typeof current_url === 'string' ? current_url.replace(/\/+$/, '') : '';
        return baseUrl + (path.charAt(0) === '/' ? path : '/' + path);
    };

var app = angular.module('adminApp', []);

//Danh mục SP
app.controller('DanhMucCtrl',function($scope,$http){
    $scope.danhMucItem = [];
    $scope.maDanhMuc = "";
    $scope.tenDanhMuc="";

    $scope.getDanhMuc = function(){
        $http({
            method : "GET",
            url: apiUrl('/api-admin/DanhMuc/get-all')
        }).then(function(response){
            $scope.danhMucItem = response.data;
        });
    }
    $scope.getDanhMuc();


    //thêm danh mục
    $scope.addDanhMuc = function() {
        let dataDanhMuc = {
            MaDanhMuc: $scope.maDanhMuc,
            TenDanhMuc: $scope.tenDanhMuc
        };

        $http({
            method: "POST",
            url: apiUrl('/api-admin/DanhMuc/dm-create'),
            data: dataDanhMuc
        }).then(function(response) {
            alert("Thêm thành công");
            $scope.getDanhMuc();
        }).catch(function(error) {
            console.error(error);
            alert("Thêm thất bại: " + (error.data?.message || "Lỗi không xác định"));
        });
    };

})

//Sản phẩm
app.controller('SanPhamCtrl', function($scope,$http){
    $scope.sanPhamItem=[];
    $scope.maSanPham ="";
    $scope.tenSanPham ="";
    $scope.sl ="";
    $scope.gia ="";
    $scope.moTaSP ="";
    $scope.maDanhMuc ="";
    $scope.anhSP ="";

    $scope.getSanPham = function(){
        $http({
            method : "GET",
            url: apiUrl('/api-admin/SanPham/get-all-sp')
        }).then(function(response){
            $scope.sanPhamItem = response.data;
        });
    }
    $scope.getSanPham();
    $scope.anhSP = '';
    $scope.imagePreview = '';
    $scope.spDangSua = {};

    $scope.triggerInput = function () {
      document.getElementById('image').click();
    };

    $scope.triggerEditInput = function () {
      document.getElementById('editImage').click();
    };

    $scope.previewImage = function (input) {
      const file = input.files[0];
      if (file) {
        $scope.anhSP = file.name;

        const reader = new FileReader();
        reader.onload = function (e) {
          $scope.$apply(function () {
            $scope.imagePreview = e.target.result;
          });
        };
        reader.readAsDataURL(file);
      }
    };

    $scope.previewEditImage = function (input) {
      const file = input.files[0];
      if (file) {
        $scope.$apply(function () {
          $scope.spDangSua.anhSP = file.name;
        });

        const reader = new FileReader();
        reader.onload = function (e) {
          $scope.$apply(function () {
            $scope.imagePreview = e.target.result;
          });
          $('#imageSPDangSua').attr('src', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };

    //thêm sản phẩm
    $scope.addSanPham = function() {
        let dataSanPham = {
            maSanPham: $scope.maSanPham,
            tenSanPham: $scope.tenSanPham,
            sl: parseInt($scope.sl, 10),
            gia: parseFloat($scope.gia),
            moTaSP: $scope.moTaSP,
            maDanhMuc: parseInt($scope.maDanhMuc, 10),
            anhSP: $scope.anhSP
        };

        console.log("Dữ liệu gửi đến API:", dataSanPham);

        $http({
            method: "POST",
            url: apiUrl('/api-admin/SanPham/sp-create'),
            data: dataSanPham
        }).then(function(response) {
            alert("Thêm thành công");
            $scope.getSanPham();
        }).catch(function(error) {
            console.error("Lỗi API:", error);
            alert("Thêm thất bại: " + (error.data?.message || "Lỗi không xác định"));
        });
    };

    // Xóa sản phẩm
    $scope.deleteSanPham = function (maSanPham) {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
            $http({
                method: "DELETE",
                url: apiUrl(`/api-admin/SanPham/Delete/${maSanPham}`) // Thay URL API phù hợp
            }).then(function (response) {
                alert("Xóa thành công!");
                $scope.getSanPham(); // Tải lại danh sách sản phẩm sau khi xóa
            }).catch(function (error) {
                console.error(error);
                alert("Xóa thất bại: " + (error.data?.message || "Lỗi không xác định"));
            });
        }
    };

    //sửa sản phẩm
    $scope.editSanPham = function (maSanPham) {
        $http.get(apiUrl('/api-admin/SanPham/get-by-id/' + maSanPham))
            .then(function (response) {
                $scope.spDangSua = response.data;
                console.log($scope.spDangSua)
                $('#idSpDangSua').val($scope.spDangSua.maSanPham);
                $('#tenSpDangSua').val($scope.spDangSua.tenSanPham);        // Tên sản phẩm
                $('#SLSpDangSua').val($scope.spDangSua.sl);        // Số lượng
                $('#GiaSpDangSua').val($scope.spDangSua.gia);       // Giá
                $('#MoTaSpDangSua').val($scope.spDangSua.moTaSP);       // Mô tả
                $('#MDMSpDangSua').val($scope.spDangSua.maDanhMuc);
                $('#duongDanAnhSPDangSua').val($scope.spDangSua.anhSP);
                $('#imageSPDangSua').attr('src',$scope.spDangSua.anhSP);
                const formElement = document.getElementById("editForm");
                if (formElement) {
                    formElement.style.display = "flex";
                } else {
                    console.error("Không tìm thấy phần tử với id 'editForm'");
                }
            }, function (error) {
                console.error("Lỗi khi lấy thông tin sản phẩm:", error);
            });
    };


    // Lưu thông tin sản phẩm đã sửa

    $scope.saveSanPham = function () {
        var data = {
            maSanPham:$scope.spDangSua.maSanPham,
            tenSanPham:$scope.spDangSua.tenSanPham,
            sl: parseInt($scope.spDangSua.sl, 10), // Đảm bảo số lượng là số nguyên
        gia: parseFloat($scope.spDangSua.gia), // Đảm bảo giá trị là số thực
        moTaSP: $scope.spDangSua.moTaSP,
        maDanhMuc: parseInt($scope.spDangSua.maDanhMuc, 10), // Đảm bảo mã danh mục là số nguyên
            anhSP:$scope.spDangSua.anhSP
        }
        $http({
            method:"POST",
            url: apiUrl('/api-admin/SanPham/sp-update'),
            data:data
        })
            .then(function (response) {
                alert("Cập nhật sản phẩm thành công!");
                $scope.getSanPham();
                $scope.closeEditForm();
            }, function (error) {
                console.error("Lỗi khi cập nhật sản phẩm:", error);
            });
        console.log(data);
    };

    // Đóng form sửa
    $scope.closeEditForm = function () {
        document.getElementById("editForm").style.display = "none";
    };

});

//Tài khoản
app.controller('TaiKhoanCtrl', function($scope, $http){
    $scope.taiKhoanItem = [];
    $scope.maTK = "";
    $scope.tenTK = "";
    $scope.matKhau ="";
    $scope.quyen ="";
    $scope.email ="";
    $scope.trangThai ="";

    $scope.getTaiKhoan = function(){
        $http({
            method : "GET",
            url: apiUrl('/api-admin/TaiKhoan/get-all-tk')
        }).then(function(response){
            $scope.taiKhoanItem = response.data;
        });
    }
    $scope.getTaiKhoan();

    //thêm tài khoản
    $scope.addTaiKhoan = function() {
        let dataTaiKhoan = {
            MaTK: $scope.maTK,
            TenTK: $scope.tenTK,
            MatKhau: $scope.matKhau,
            Quyen: $scope.quyen,
            Email: $scope.email ,
            TrangThai: $scope.trangThai
        };
        console.log("Dữ liệu gửi đi:", dataTaiKhoan);

        $http({
            method: "POST",
            url: apiUrl('/api-admin/TaiKhoan/tk-create'),
            data: dataTaiKhoan
        }).then(function(response) {
            alert("Thêm thành công");
            $scope.getTaiKhoan();
        }).catch(function(error) {
            console.error("Lỗi khi gọi API:",error);
            alert("Thêm thất bại: " + (error.data?.message || "Lỗi không xác định"));
        });
    };
    // Xóa tài khoản
    $scope.deleteTaiKhoan = function (maTK) {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
            $http({
                method: "DELETE",
                url: apiUrl(`/api-admin/TaiKhoan/Delete/${maTK}`) // Thay URL API phù hợp
            }).then(function (response) {
                alert("Xóa thành công!");
                $scope.getTaiKhoan(); // Tải lại danh sách sản phẩm sau khi xóa
            }).catch(function (error) {
                console.error(error);
                alert("Xóa thất bại: " + (error.data?.message || "Lỗi không xác định"));
            });
        }
    };

    //sửa tài khoản
    $scope.tkDangSua = {}; // Dùng để lưu thông tin sản phẩm đang sửa

    $scope.editTaiKhoan = function (maTK) {
        $http.get(apiUrl('/api-admin/TaiKhoan/get-by-id/' + maTK))
            .then(function (response) {
                $scope.tkDangSua = response.data;
                console.log($scope.tkDangSua)
                $('#maTKDangSua').val($scope.tkDangSua.maTK);
                $('#tenTKDangSua').val($scope.tkDangSua.tenTK);        // Tên sản phẩm
                $('#quyenDangSua').val($scope.tkDangSua.quyen);        // Số lượng
                $('#mkDangSua').val($scope.tkDangSua.matKhau);       // Giá
                $('#emailDangSua').val($scope.tkDangSua.email);       // Mô tả
                $('#trangthaiDangSua').val($scope.tkDangSua.trangThai);
                const formElement = document.getElementById("editFormTK");
                if (formElement) {
                    formElement.style.display = "flex";
                } else {
                    console.error("Không tìm thấy phần tử với id 'editFormTK'");
                }
            }, function (error) {
                console.error("Lỗi khi lấy thông tin tài khoản:", error);
            });
    };


    // Lưu thông tin tài khoản đã sửa

    $scope.saveTaiKhoan = function () {
        var data = {
            maTK:$scope.tkDangSua.maTK,
            tenTK:$scope.tkDangSua.tenTK,
            quyen:$scope.tkDangSua.quyen,
            matKhau:$scope.tkDangSua.matKhau,
            email:$scope.tkDangSua.email,
            trangThai:$scope.tkDangSua.trangThai
        }
        $http({
            method:"POST",
            url: apiUrl('/api-admin/TaiKhoan/tk-update'),
            data:data
        })
            .then(function (response) {
                alert("Cập nhật thông tin tài khoản thành công!");
                $scope.getTaiKhoan();
                $scope.closeEditFormTK();
            }, function (error) {
                console.error("Lỗi khi cập nhật tài khoản:", error);
            });
        console.log(data);
    };

    // Đóng form sửa
    $scope.closeEditFormTK = function () {
        document.getElementById("editFormTK").style.display = "none";
    };
})

//Voucher
app.controller('VoucherCtrl', function($scope, $http){
    $scope.voucherItem = [];
    $scope.voucher_id = "";
    $scope.voucher_name = "";
    $scope.giaTien ="";
    $scope.giaToiThieu ="";
    $scope.slCon = "";
    $scope.batDau = "";
    $scope.ketThuc ="";

    $scope.getVoucher = function(){
        $http({
            method : "GET",
            url: apiUrl('/api-admin/Voucher/get-all-voucher')
        }).then(function(response){

            $scope.voucherItem = response.data;
        });
    }
    $scope.getVoucher();
    //thêm voucher
    $scope.addVoucher = function() {

        let dataVoucher = {
            Voucher_id: $scope.voucher_id,
            Voucher_name: $scope.voucher_name,
            GiaTien: $scope.giaTien,
            GiaToiThieu: $scope.giaToiThieu,
            SLCon: $scope.slCon,
            BatDau: $scope.batDau,
            KetThuc: $scope.ketThuc
        };

        $http({
            method: "POST",
            url: apiUrl('/api-admin/Voucher/voucher-create'),
            data: dataVoucher
        }).then(function(response) {
            alert("Thêm thành công");
            $scope.getVoucher();
        }).catch(function(error) {
            console.error(error);
            alert("Thêm thất bại: " + (error.data?.message || "Lỗi không xác định"));
        });
    };

    // Xóa Voucher
    $scope.deleteVoucher = function (voucher_id) {
        if (confirm("Bạn có chắc chắn muốn xóa voucher này không?")) {
            $http({
                method: "DELETE",
                url: apiUrl(`/api-admin/Voucher/Delete/${voucher_id}`) // Thay URL API phù hợp
            }).then(function (response) {
                alert("Xóa thành công!");
                $scope.getVoucher(); // Tải lại danh sách sản phẩm sau khi xóa
            }).catch(function (error) {
                console.error(error);
                alert("Xóa thất bại: " + (error.data?.message || "Lỗi không xác định"));
            });
        }
    };

    //sửa tài khoản
    $scope.tkDangSua = {}; // Dùng để lưu thông tin sản phẩm đang sửa

    $scope.editVoucher = function (voucher_id) {
        $http.get(apiUrl('/api-admin/Voucher/get-by-id/' + voucher_id))
            .then(function (response) {
                $scope.vcDangSua = response.data;
                console.log($scope.vcDangSua)
                $('#voucher_idDangSua').val($scope.vcDangSua.voucher_id);
                $('#tenVCDangSua').val($scope.vcDangSua.voucher_name);        // Tên sản phẩm
                $('#giaDangSua').val($scope.vcDangSua.giaTien);        // Số lượng
                $('#giaTTDangSua').val($scope.vcDangSua.giaToiThieu);       // Giá
                $('#slgDangSua').val($scope.vcDangSua.slCon);       // Mô tả
                $('#startDangSua').val($scope.vcDangSua.batDau);
                $('#endDangSua').val($scope.vcDangSua.ketThuc);
                const formElement = document.getElementById("editFormVC");
                if (formElement) {
                    formElement.style.display = "flex";
                } else {
                    console.error("Không tìm thấy phần tử với id 'editFormVC'");
                }
            }, function (error) {
                console.error("Lỗi khi lấy thông tin tài khoản:", error);
            });
    };


    // Lưu thông tin tài khoản đã sửa

    $scope.saveVoucher = function () {
        var data = {
            voucher_id:$scope.vcDangSua.voucher_id,
            voucher_name:$scope.vcDangSua.voucher_name,
            giaTien:$scope.vcDangSua.giaTien,
            giaToiThieu:$scope.vcDangSua.giaToiThieu,
            slCon:$scope.vcDangSua.slCon,
            batDau:$scope.vcDangSua.batDau,
            ketThuc:$scope.vcDangSua.ketThuc
        }
        $http({
            method:"POST",
            url: apiUrl('/api-admin/Voucher/voucher-update'),
            data:data
        })
            .then(function (response) {
                alert("Cập nhật thông tin Voucher thành công!");
                $scope.getVoucher();
                $scope.closeEditFormVC();
            }, function (error) {
                console.error("Lỗi khi cập nhật Voucher:", error);
            });
        console.log(data);
    };

    // Đóng form sửa
    $scope.closeEditFormVC = function () {
        document.getElementById("editFormVC").style.display = "none";
    };

})

//Người dùng
app.controller('NguoiDungCtrl', function($scope, $http){
    $scope.nguoiDungItem = [];
    $scope.taiKhoanDangKyItem = [];
    $scope.accountSearchQuery = "";
    $scope.maND = "";
    $scope.tenND = "";
    $scope.sinhNhat ="";
    $scope.diaChi ="";
    $scope.sdt = "";
    $scope.anh = "";
    $scope.gioiTinh ="";

    $scope.getNguoiDung = function(){
        $http({
            method : "GET",
            url: apiUrl('/api-admin/NguoiDung/get-all-nd')
        }).then(function(response){

            $scope.nguoiDungItem = response.data;
        });
    }

    $scope.getTaiKhoanDangKy = function(){
        $http({
            method : "GET",
            url: apiUrl('/api-admin/TaiKhoan/get-all-tk')
        }).then(function(response){
            $scope.taiKhoanDangKyItem = Array.isArray(response.data) ? response.data : [];
        }).catch(function(error) {
            console.error("Loi khi lay danh sach tai khoan dang ky:", error);
            $scope.taiKhoanDangKyItem = [];
        });
    }

    $scope.getNguoiDungImageUrl = function(anh) {
        const imageVersion = '20260504';
        const frontendOrigin = window.location.origin || '';
        const customersImageRoot = frontendOrigin + '/assets/images/customers/';
        const fallbackImage = customersImageRoot + 'avt.jpg?v=' + imageVersion;
        if (!anh) {
            return fallbackImage;
        }

        let imageValue = String(anh).trim();
        if (!imageValue) {
            return fallbackImage;
        }

        if (/^data:image\//i.test(imageValue) || /^https?:\/\//i.test(imageValue)) {
            return imageValue;
        }

        const avatarMap = {
            'avatar1.jpg': 'kh6.jpg',
            'avatar2.jpg': 'kh7.jpg',
            'avatar3.jpg': 'kh8.jpg',
            'avatar4.jpg': 'kh9.jpg'
        };
        const fileName = avatarMap[imageValue.toLowerCase()] || imageValue;
        return customersImageRoot + encodeURIComponent(fileName) + '?v=' + imageVersion;
    };

    $scope.getNguoiDung();
    $scope.getTaiKhoanDangKy();
    //thêm người dùng
    $scope.anh = '';
    $scope.imagePreviewND = '';

    $scope.triggerInput = function () {
      document.getElementById('imageND').click();
    };

    $scope.anh = '';
    $scope.imagePreviewND = '';

    $scope.triggerInput = function () {
      document.getElementById('imageND').click();
    };

    $scope.previewImageND = function (input) {
      const file = input.files[0];
      if (file) {
        $scope.anh = file.name;

        const reader = new FileReader();
        reader.onload = function (e) {
          $scope.$apply(function () {
            $scope.imagePreviewND = e.target.result;
          });
        };
        reader.readAsDataURL(file);
      }
    };
    $scope.addNguoiDung = function() {
        let formattedDate = $scope.sinhNhat ? new Date($scope.sinhNhat).toISOString().split('T')[0] : null; // Chuyển sang yyyy-MM-dd
        let dataNguoiDung = {
            MaND: $scope.maND,
            TenND: $scope.tenND,
            SinhNhat: formattedDate,
            DiaChi: $scope.diaChi,
            SDT: $scope.sdt,
            Anh: $scope.anh,
            GioiTinh: $scope.gioiTinh
        };

        $http({
            method: "POST",
            url: apiUrl('/api-admin/NguoiDung/nd-create'),
            data: dataNguoiDung
        }).then(function(response) {
            alert("Thêm thành công");
            $scope.getNguoiDung();
        }).catch(function(error) {
            console.error(error);
            alert("Thêm thất bại: " + (error.data?.message || "Lỗi không xác định"));
        });
    };

    // Xóa người dùng
    $scope.deleteNguoiDung = function (maND) {
        if (confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
            $http({
                method: "DELETE",
                url: apiUrl(`/api-admin/NguoiDung/nd-Delete/${maND}`)
            }).then(function (response) {
                alert("Xóa thành công!");
                $scope.getNguoiDung(); // Tải lại danh sách sản phẩm sau khi xóa
            }).catch(function (error) {
                console.error(error);
                alert("Xóa thất bại: " + (error.data?.message || "Lỗi không xác định"));
            });
        }
    };

    //sửa người dùng
    $scope.ndDangSua = {}; // Dùng để lưu thông tin đang sửa
    $scope.imagePreviewND = ""; // Hiển thị ảnh xem trước

    $scope.editNguoiDung = function (maND) {

        $http.get(apiUrl('/api-admin/NguoiDung/get-by-id/' + maND))
            .then(function (response) {

                $scope.ndDangSua = response.data;
                console.log($scope.ndDangSua)
                // Chuyển đổi định dạng ngày tháng (ISO -> yyyy-MM-dd)
                if ($scope.ndDangSua.sinhNhat) {
                    let date = new Date($scope.ndDangSua.sinhNhat); // Chuyển sang đối tượng Date
                    $scope.ndDangSua.sinhNhat = date.toISOString().split('T')[0]; // Lấy định dạng yyyy-MM-dd
                }

                // Gán dữ liệu vào các trường
                $('#mandDangSua').val($scope.ndDangSua.maND);
                $('#tenndDangSua').val($scope.ndDangSua.tenND);
                $('#sinhnhatDangSua').val($scope.ndDangSua.sinhNhat);
                $('#diachiDangSua').val($scope.ndDangSua.diaChi);
                $('#sdTDangSua').val($scope.ndDangSua.sdt);
                $('#gioitinhDangSua').val($scope.ndDangSua.gioiTinh);
                $('#duongDanAnhNDDangSua').val($scope.ndDangSua.anh);
                $('#imageNDDangSua').attr('src', $scope.ndDangSua.anh);
                const formElement = document.getElementById("editFormND");
                if (formElement) {
                    formElement.style.display = "flex";
                } else {
                    console.error("Không tìm thấy phần tử với id 'editForm'");
                }
            }, function (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            });
    };


    // Lưu thông tin sản phẩm đã sửa

    $scope.saveNguoiDung = function () {
        var data = {
            maND:$scope.ndDangSua.maND,
            tenND:$scope.ndDangSua.tenND,
            sinhNhat:$scope.ndDangSua.sinhNhat,
            diaChi:$scope.ndDangSua.diaChi,
            gioiTinh:$scope.ndDangSua.gioiTinh,
            sdt:$scope.ndDangSua.sdt,
            anh:$scope.ndDangSua.anh
        }
        $http({
            method:"POST",
            url: apiUrl('/api-admin/NguoiDung/nd-update'),
            data:data
        })
            .then(function (response) {
                alert("Cập nhật thông tin người dùng thành công!");
                $scope.getNguoiDung();
                $scope.closeEditFormND();
            }, function (error) {
                console.error("Lỗi khi cập nhật thông tin người dùng:", error);
            });
        console.log(data);
    };

    // Đóng form sửa
    $scope.closeEditFormND = function () {
        document.getElementById("editFormND").style.display = "none";
    };

})

//Hoá đơn
app.controller('HoaDonCtrl',function($scope,$http){
    $scope.hoaDonItem = [];
    $scope.maHD = "";
    $scope.tongTien="";
    $scope.trangThai="";
    $scope.diaChiGiao="";
    $scope.maChiTietHD="";
    $scope.slsp="";
    $scope.gia="";
    $scope.soTienGiam="";
    $scope.maSanPham="";
    $scope.maVoucher="";


    $scope.getHoaDon = function(){
        $http({
            method : "GET",
            url: apiUrl('/api-admin/HoaDon/get-all-hd')
        }).then(function(response){
            $scope.hoaDonItem= response.data;
        });
    }
    $scope.getHoaDon();
    //get by id hoá đơn
    $scope.hdChiTiet = {}; // Dùng để lưu thông tin đang sửa
    $scope.CTHDitem = [];


    $scope.getCTHoaDon = function (maHD) {
        $http.get(apiUrl('/api-admin/HoaDon/get-data-by-id/' + maHD))
            .then(function (response) {
                $scope.hdChiTiet = response.data || {};
                $scope.CTHDitem = Array.isArray($scope.hdChiTiet.listjson_chitiet) ? $scope.hdChiTiet.listjson_chitiet : [];
                const formElement = document.getElementById("editFormHD");
                if (formElement) {
                    formElement.style.display = "flex";
                } else {
                    console.error("Không tìm thấy phần tử với id 'editFormHD'");
                }
            }, function (error) {
                console.error("Lỗi khi lấy thông tin tài khoản:", error);
            });
    };
    // Đóng form sửa
    $scope.closeEditFormHD = function () {
        document.getElementById("editFormHD").style.display = "none";
    };



})

