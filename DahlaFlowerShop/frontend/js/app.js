var apiUrl = typeof buildApiUrl === 'function'
    ? buildApiUrl
    : function (path) {
        var baseUrl = typeof current_url === 'string' ? current_url.replace(/\/+$/, '') : '';
        return baseUrl + (path.charAt(0) === '/' ? path : '/' + path);
    };

var app = angular.module('userApp', []);

app.controller("trangchuCtrl", function ($scope, $http) {
    $scope.list_DanhMuc = [];
    $scope.tenDanhMuc = "";
    $scope.danhMucId = null;
    $scope.list_SanPham = [];
    $scope.loginData = {
        tenTK: "",
        matKhau: ""
    };
    $scope.loginMessage = "";
    $scope.tenTaiKhoan = null;

    $scope.LoadDanhMuc = function () {
        $http({
            method: 'GET',
            url: apiUrl('/api-user/DanhMuc/get-all')
        }).then(function (response) {
            $scope.list_DanhMuc = response.data;
            console.log($scope.list_DanhMuc);
        }, function (error) {
            console.error('Lỗi khi tải danh mục:', error);
        });
    };

    $scope.LoadDanhMuc();

    $scope.Login = function () {
        if (!$scope.loginData.tenTK || !$scope.loginData.matKhau) {
            $scope.loginMessage = "Vui lòng nhập tên đăng nhập và mật khẩu.";
            return;
        }

        $http({
            method: 'POST',
            url: apiUrl('/api-user/TaiKhoan/CheckLogin'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify($scope.loginData)
        }).then(function (response) {
            console.log("Đăng nhập thành công", response.data);
            localStorage.setItem('MaND', response.data.maND);
            alert("Đăng nhập thành công!");
            $scope.loginMessage = "Bạn đã đăng nhập thành công!";

            setTimeout(function () {
                window.location.href = "../../index.html";
            }, 2000);
        }, function (error) {
            console.error("Đăng nhập thất bại", error);
            $scope.loginMessage = "Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.";
        });
    };

    $scope.GetTenDanhMuc = function () {
        var danhMucElement = document.querySelector('#tenDanhMuc, [data-ten-danh-muc]');
        if (!danhMucElement) {
            return;
        }

        var tenDanhMuc = danhMucElement.getAttribute("data-ten-danh-muc") || danhMucElement.textContent;
        $scope.tenDanhMuc = tenDanhMuc ? tenDanhMuc.trim() : "";
    };

    $scope.GetDanhMucIdByTen = function () {
        if (!$scope.tenDanhMuc) {
            return;
        }

        $http({
            method: 'GET',
            url: apiUrl('/api-user/DanhMuc/get-all')
        }).then(function (response) {
            var danhMucList = Array.isArray(response.data) ? response.data : [];
            var tenDanhMuc = ($scope.tenDanhMuc || "").trim().toLowerCase();

            var danhMuc = danhMucList.find(function (dm) {
                var tenHienTai = (dm.tenDanhMuc || "").trim().toLowerCase();
                return tenHienTai === tenDanhMuc || tenHienTai.includes(tenDanhMuc) || tenDanhMuc.includes(tenHienTai);
            });

            if (danhMuc) {
                $scope.danhMucId = danhMuc.maDanhMuc;
                $scope.LoadSanPhamByDanhMucId();
            } else {
                console.error("Không tìm thấy danh mục có tên:", $scope.tenDanhMuc);
            }
        }, function (error) {
            console.error("Lỗi khi tải danh sách danh mục:", error);
        });
    };

    $scope.LoadSanPhamByDanhMucId = function () {
        if ($scope.danhMucId === null || $scope.danhMucId === undefined) {
            console.error("Không có ID danh mục để tải sản phẩm.");
            return;
        }

        $http({
            method: 'GET',
            url: apiUrl('/api-user/SanPham/get-by-danh-muc/' + $scope.danhMucId)
        }).then(function (response) {
            $scope.list_SanPham = Array.isArray(response.data) ? response.data : [];
            console.log("Sản phẩm của danh mục:", $scope.list_SanPham);
        }, function (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        });
    };

    $scope.GetTenDanhMuc();
    $scope.GetDanhMucIdByTen();
});

app.controller('DangKyCtrl', function ($scope, $http, $window, $q) {
    $scope.nguoiDungItem = [];
    $scope.taiKhoanItem = [];
    $scope.maTK = "";
    $scope.maND = "";
    $scope.tenTK = "";
    $scope.matKhau = "";
    $scope.email = "";
    $scope.tenND = "";
    $scope.sinhNhat = "";
    $scope.diaChi = "";
    $scope.sdt = "";
    $scope.anh = "";
    $scope.gioiTinh = "Nam";
    $scope.imagePreviewND = '';
    $scope.isSubmitting = false;
    $scope.registerMessage = "";

    function getErrorMessage(error) {
        if (!error) {
            return "Lỗi không xác định";
        }

        var data = error.data;
        if (data) {
            if (typeof data === "string") {
                return data.length > 300 ? data.substring(0, 300) + "..." : data;
            }

            if (data.message) {
                return data.message;
            }

            if (data.title) {
                return data.title;
            }

            if (data.errors) {
                var messages = [];
                Object.keys(data.errors).forEach(function (key) {
                    var value = data.errors[key];
                    if (Array.isArray(value)) {
                        messages = messages.concat(value);
                    } else if (value) {
                        messages.push(value);
                    }
                });

                if (messages.length) {
                    return messages.join("; ");
                }
            }
        }

        if (error.status) {
            return "HTTP " + error.status + (error.statusText ? " - " + error.statusText : "");
        }

        return "Lỗi không xác định";
    }

    function showRegistrationError(prefix, error) {
        var message = prefix + ": " + getErrorMessage(error);
        console.error(message, error);
        $scope.registerMessage = message;
        alert(message);
    }

    function normalizeText(value) {
        return String(value || "").trim();
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateRegistrationForm() {
        if (!normalizeText($scope.tenTK)) {
            return "Vui lòng nhập tên đăng nhập.";
        }

        if (!normalizeText($scope.matKhau)) {
            return "Vui lòng nhập mật khẩu.";
        }

        if (!isValidEmail(normalizeText($scope.email))) {
            return "Vui lòng nhập email hợp lệ.";
        }

        if (!normalizeText($scope.tenND)) {
            return "Vui lòng nhập họ tên.";
        }

        if (!/^0[0-9]{9}$/.test(normalizeText($scope.sdt))) {
            return "Số điện thoại phải gồm 10 số và bắt đầu bằng 0.";
        }

        return "";
    }

    function formatDateOnly(value) {
        if (!value) {
            return null;
        }

        var date = new Date(value);
        if (isNaN(date.getTime())) {
            return null;
        }

        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");
        return date.getFullYear() + "-" + month + "-" + day;
    }

    $scope.getNguoiDung = function () {
        return $http({
            method: "GET",
            url: apiUrl('/api-admin/NguoiDung/get-all-nd')
        }).then(function (response) {
            $scope.nguoiDungItem = Array.isArray(response.data) ? response.data : [];
            return $scope.nguoiDungItem;
        }).catch(function (error) {
            $scope.nguoiDungItem = [];
            return $q.reject(error);
        });
    };

    $scope.getTaiKhoan = function () {
        return $http({
            method: "GET",
            url: apiUrl('/api-admin/TaiKhoan/get-all-tk')
        }).then(function (response) {
            $scope.taiKhoanItem = Array.isArray(response.data) ? response.data : [];
            return $scope.taiKhoanItem;
        }).catch(function (error) {
            $scope.taiKhoanItem = [];
            return $q.reject(error);
        });
    };

    $scope.refreshRegistrationData = function () {
        return $q.all([
            $scope.getNguoiDung(),
            $scope.getTaiKhoan()
        ]);
    };

    $scope.refreshRegistrationData().catch(function (error) {
        console.error("Không thể tải dữ liệu đăng ký:", error);
    });

    $scope.triggerInput = function () {
        document.getElementById('imageND').click();
    };

    $scope.previewImageND = function (input) {
        var file = input.files[0];
        if (!file) {
            return;
        }

        $scope.anh = file.name;
        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.$apply(function () {
                $scope.imagePreviewND = e.target.result;
            });
        };
        reader.readAsDataURL(file);
    };

    $scope.checkMaTKExist = function (maTK) {
        return $scope.taiKhoanItem.some(function (taiKhoan) {
            return taiKhoan.maTK === maTK;
        });
    };

    $scope.checkMaNDExist = function (maND) {
        return $scope.nguoiDungItem.some(function (nguoiDung) {
            return nguoiDung.maND === maND;
        });
    };

    $scope.generateMaTK = function () {
        return $scope.taiKhoanItem.reduce(function (maxValue, taiKhoan) {
            var currentValue = parseInt(taiKhoan.maTK, 10);
            return isNaN(currentValue) || currentValue < maxValue ? maxValue : currentValue;
        }, 0) + 1;
    };

    $scope.generateMaND = function () {
        return $scope.nguoiDungItem.reduce(function (maxValue, nguoiDung) {
            var currentValue = parseInt(nguoiDung.maND, 10);
            return isNaN(currentValue) || currentValue < maxValue ? maxValue : currentValue;
        }, 0) + 1;
    };

    $scope.generateUniqueId = function () {
        var nextId = Math.max($scope.generateMaTK(), $scope.generateMaND());
        while ($scope.checkMaTKExist(nextId) || $scope.checkMaNDExist(nextId)) {
            nextId += 1;
        }
        return nextId;
    };

    $scope.addNguoiDung = function () {
        var validationError = validateRegistrationForm();
        if (validationError) {
            $scope.registerMessage = validationError;
            alert(validationError);
            return;
        }

        if ($scope.isSubmitting) {
            return;
        }

        $scope.isSubmitting = true;
        $scope.registerMessage = "";

        var currentStep = "Đăng ký thất bại";
        $scope.refreshRegistrationData().then(function () {
            var requestedUsername = normalizeText($scope.tenTK).toLowerCase();
            var usernameExists = $scope.taiKhoanItem.some(function (taiKhoan) {
                return normalizeText(taiKhoan.tenTK).toLowerCase() === requestedUsername;
            });

            if (usernameExists) {
                return $q.reject({ data: { message: "Tên đăng nhập đã tồn tại." } });
            }

            var nextId = $scope.generateUniqueId();
            var formattedDate = formatDateOnly($scope.sinhNhat);

            $scope.maTK = nextId;
            $scope.maND = nextId;

            var dataTaiKhoan = {
                maTK: nextId,
                tenTK: normalizeText($scope.tenTK),
                matKhau: normalizeText($scope.matKhau),
                quyen: "User",
                email: normalizeText($scope.email),
                trangThai: "Hoạt động"
            };

            currentStep = "Thêm tài khoản thất bại";
            return $http({
                method: "POST",
                url: apiUrl('/api-admin/TaiKhoan/tk-create'),
                data: dataTaiKhoan
            }).then(function (response) {
                var maTK = parseInt(response.data && response.data.maTK, 10);
                if (isNaN(maTK)) {
                    maTK = nextId;
                }

                var dataNguoiDung = {
                    MaND: maTK,
                    TenND: normalizeText($scope.tenND),
                    SinhNhat: formattedDate,
                    DiaChi: normalizeText($scope.diaChi),
                    SDT: parseInt(normalizeText($scope.sdt), 10),
                    Anh: $scope.imagePreviewND || normalizeText($scope.anh),
                    GioiTinh: normalizeText($scope.gioiTinh) || "Nam"
                };

                currentStep = "Thêm người dùng thất bại";
                return $http({
                    method: "POST",
                    url: apiUrl('/api-admin/NguoiDung/nd-create'),
                    data: dataNguoiDung
                });
            });
        }).then(function () {
            alert("Đăng ký tài khoản thành công!");
            $scope.refreshRegistrationData();
            setTimeout(function () {
                $window.location.href = 'login.html';
            }, 500);
        }).catch(function (error) {
            showRegistrationError(currentStep, error);
        }).finally(function () {
            $scope.isSubmitting = false;
        });
    };
});

app.controller('SanPhamCtrl', function ($scope, $http) {
    $scope.sanPhamItem = [];
    $scope.filteredProducts = [];
    $scope.searchQuery = '';

    $scope.getSanPham = function () {
        $http({
            method: "GET",
            url: apiUrl('/api-user/SanPham/get-all-sp')
        }).then(function (response) {
            $scope.sanPhamItem = Array.isArray(response.data) ? response.data : [];
        });
    };

    $scope.getSanPham();

    $scope.searchProducts = function () {
        if (!$scope.searchQuery || $scope.searchQuery === '') {
            $scope.filteredProducts = [];
            return;
        }

        $scope.filteredProducts = $scope.sanPhamItem.filter(function (product) {
            return product.tenSanPham.toLowerCase().includes($scope.searchQuery.toLowerCase());
        });
    };
});

app.controller('InvoiceController', function ($scope, $http, $window) {
    function parsePrice(value) {
        return parseFloat(String(value || 0).replace(/[^0-9.-]/g, '')) || 0;
    }

    function generateAutoCode() {
        var now = new Date();
        var hours = now.getHours().toString().padStart(2, '0');
        var minutes = now.getMinutes().toString().padStart(2, '0');
        var seconds = now.getSeconds().toString().padStart(2, '0');
        var milliseconds = now.getMilliseconds().toString().padStart(3, '0');
        return parseInt(hours + minutes + seconds + milliseconds, 10);
    }

    $scope.createInvoice = function () {
        var maHD = generateAutoCode();
        var listCart = JSON.parse(localStorage.getItem("DatHang")) || {};
        var maND = parseInt(localStorage.getItem("MaND"), 10);

        if (Object.keys(listCart).length === 0) {
            alert("Giỏ hàng của bạn trống, không thể tạo hóa đơn!");
            return;
        }

        if (isNaN(maND)) {
            alert("Vui lòng đăng nhập trước khi tạo hóa đơn!");
            return;
        }

        var listjson_chitiet = Object.values(listCart).map(function (item) {
            return {
                MaChiTietHD: generateAutoCode() + 1,
                SLSP: parseInt(item.quantity, 10) || 0,
                Gia: parsePrice(item.price),
                SoTienGiam: 0,
                MaHD: maHD,
                MaSanPham: parseInt(item.id, 10),
                MaVoucher: null
            };
        });

        var totalAmount = 0;
        Object.values(listCart).forEach(function (item) {
            var quantity = parseInt(item.quantity, 10) || 0;
            var price = parsePrice(item.price);
            totalAmount += quantity * price;
        });

        var invoiceData = {
            MaHD: maHD,
            NgayMua: new Date().toISOString().slice(0, 10),
            TongTien: totalAmount,
            TrangThai: "Đang chờ",
            DiaChiGiao: "Hưng Yên",
            MaND: maND,
            listjson_chitiet: listjson_chitiet
        };

        $http({
            method: "post",
            url: apiUrl('/api-user/HoaDon/hd-create'),
            data: invoiceData
        }).then(function () {
            alert('Hóa đơn đã được tạo thành công!');
            localStorage.removeItem("DatHang");
            $window.location.href = '../cart.html';
        }).catch(function (error) {
            console.error('Lỗi khi tạo hóa đơn:', error);
            alert('Đã xảy ra lỗi khi tạo hóa đơn. Vui lòng thử lại!');
        });
    };
});
