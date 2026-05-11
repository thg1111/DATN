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
    $scope.hasSearched = false;
    var searchSeedProducts = [
        { maSanPham: 1, tenSanPham: 'Trăm năm', gia: 6759000, anhSP: 'snst1.jpg', moTaSP: 'Hoa sinh nhật cao cấp.' },
        { maSanPham: 2, tenSanPham: 'Pure Enchanter', gia: 11450000, anhSP: 'sntt2.jpg', moTaSP: 'Hoa sinh nhật cao cấp.' },
        { maSanPham: 3, tenSanPham: 'My Sweet Heart', gia: 6250000, anhSP: 'snst3.jpg', moTaSP: 'Hoa sinh nhật cao cấp.' },
        { maSanPham: 4, tenSanPham: 'Mẫu đơn hồng', gia: 2250000, anhSP: 'snst4.jpg', moTaSP: 'Hoa sinh nhật cao cấp.' },
        { maSanPham: 5, tenSanPham: 'Ánh rạng ngời', gia: 2650000, anhSP: 'snsn5.jpg', moTaSP: 'Hoa sinh nhật cao cấp.' },
        { maSanPham: 6, tenSanPham: 'Mưa ngọt ngào', gia: 1350000, anhSP: 'snst6.jpg', moTaSP: 'Hoa sinh nhật cao cấp.' },
        { maSanPham: 7, tenSanPham: 'Rainy Day', gia: 1990000, anhSP: 'snst7.jpg', moTaSP: 'Hoa sinh nhật cao cấp.' },
        { maSanPham: 8, tenSanPham: 'Thanh xuân tươi đẹp', gia: 2490000, anhSP: 'snst8.jpg', moTaSP: 'Hoa sinh nhật cao cấp.' },
        { maSanPham: 21, tenSanPham: 'Giấc mơ nhỏ bé', gia: 580000, anhSP: 'dream.jpg', moTaSP: 'Bó hoa tông nhẹ nhàng.' },
        { maSanPham: 22, tenSanPham: 'Forever Young', gia: 790000, anhSP: 'young.jpg', moTaSP: 'Bó hoa Forever Young.' },
        { maSanPham: 23, tenSanPham: 'Kiêu sa', gia: 4600000, anhSP: 'kieuxa.jpg', moTaSP: 'Bó hoa mẫu đơn và hoa hồng tông hồng sang trọng.' },
        { maSanPham: 24, tenSanPham: 'Purple', gia: 1920000, anhSP: 'perple.jpg', moTaSP: 'Bó hoa tông tím.' },
        { maSanPham: 25, tenSanPham: 'Yêu thương ngọt ngào', gia: 1050000, anhSP: 'ngotngao.jpg', moTaSP: 'Bó hoa tặng người thương.' },
        { maSanPham: 26, tenSanPham: 'Bemine', gia: 3614000, anhSP: 'bemine.jpg', moTaSP: 'Bó hoa cao cấp.' },
        { maSanPham: 27, tenSanPham: 'Em bé', gia: 1650000, anhSP: 'embe.jpg', moTaSP: 'Bó hoa tông mềm mại.' },
        { maSanPham: 28, tenSanPham: 'Say yes', gia: 3650000, anhSP: 'sn7.jpg', moTaSP: 'Bó hoa cầu hôn.' },
        { maSanPham: 29, tenSanPham: 'Chín tầng mây', gia: 3310000, anhSP: 'sn8.jpg', moTaSP: 'Bó hoa cao cấp.' },
        { maSanPham: 30, tenSanPham: 'Mùa thu (Mẫu đơn)', gia: 1990000, anhSP: 'sn2.jpg', moTaSP: 'Hoa mẫu đơn tông thu.' },
        { maSanPham: 31, tenSanPham: 'Cappybara tịnh tâm', gia: 600000, anhSP: 'gau1.jpg', moTaSP: 'Gấu bông quà tặng dễ thương.' },
        { maSanPham: 32, tenSanPham: 'Lena nón chuột (40cm)', gia: 320000, anhSP: 'gau9.jpg', moTaSP: 'Gấu bông Lena nón chuột.' },
        { maSanPham: 33, tenSanPham: 'Teddy', gia: 450000, anhSP: 'gau3.jpg', moTaSP: 'Gấu bông Teddy.' },
        { maSanPham: 34, tenSanPham: 'Jullydoll', gia: 1614000, anhSP: 'gau16.jpg', moTaSP: 'Gấu bông Jullydoll.' },
        { maSanPham: 35, tenSanPham: 'Kuromi', gia: 650000, anhSP: 'gau11.jpg', moTaSP: 'Gấu bông Kuromi.' },
        { maSanPham: 36, tenSanPham: 'BaybyThree Thỏ', gia: 350000, anhSP: 'gau10.jpg', moTaSP: 'Gấu bông thỏ.' },
        { maSanPham: 37, tenSanPham: 'Vịt vàng cute', gia: 310000, anhSP: 'gau12.jpg', moTaSP: 'Gấu bông vịt vàng.' },
        { maSanPham: 38, tenSanPham: 'Loopy', gia: 1990000, anhSP: 'gau15.jpg', moTaSP: 'Gấu bông Loopy.' },
        { maSanPham: 41, tenSanPham: 'Phút giây an lành', gia: 540000, anhSP: 'noel1.jpg', moTaSP: 'Hoa Giáng sinh.' },
        { maSanPham: 42, tenSanPham: 'Sơn tùng Noel (1m2)', gia: 990000, anhSP: 'noel2.jpg', moTaSP: 'Cây sơn tùng Noel.' },
        { maSanPham: 43, tenSanPham: 'Sưởi ấm', gia: 660000, anhSP: 'noel3.jpg', moTaSP: 'Hoa Giáng sinh.' },
        { maSanPham: 44, tenSanPham: 'Cây Sơn Tùng Noel (60cm)', gia: 614000, anhSP: 'noel4.jpg', moTaSP: 'Cây trang trí Noel.' },
        { maSanPham: 45, tenSanPham: 'Tùng mini (60cm)', gia: 480000, anhSP: 'noel5.jpg', moTaSP: 'Cây Noel mini.' },
        { maSanPham: 46, tenSanPham: 'Chrismas Eve', gia: 1980000, anhSP: 'noel6.jpg', moTaSP: 'Hoa Giáng sinh.' },
        { maSanPham: 47, tenSanPham: 'Ever Joy', gia: 910000, anhSP: 'noel7.jpg', moTaSP: 'Hoa Giáng sinh.' },
        { maSanPham: 48, tenSanPham: 'Vòng nguyệt quế Noel', gia: 2430000, anhSP: 'noel8.jpg', moTaSP: 'Vòng nguyệt quế trang trí.' },
        { maSanPham: 61, tenSanPham: 'Chớm hạ', gia: 580000, anhSP: 'chomha.jpg', moTaSP: 'Bó hoa tông hạ.' },
        { maSanPham: 62, tenSanPham: 'Đại dương xanh', gia: 1125000, anhSP: 'daiduongxanh.jpg', moTaSP: 'Bó hoa tông xanh.' },
        { maSanPham: 63, tenSanPham: 'Yêu thầm', gia: 490000, anhSP: 'yeu.jpg', moTaSP: 'Bó hoa tặng người thương.' },
        { maSanPham: 64, tenSanPham: 'Điều ngọt ngào nhất', gia: 1790000, anhSP: 'sn2.jpg', moTaSP: 'Bó hoa sinh nhật.' },
        { maSanPham: 65, tenSanPham: 'Green Day', gia: 597000, anhSP: 'sn5.jpg', moTaSP: 'Bó hoa tông xanh.' },
        { maSanPham: 66, tenSanPham: 'Kẹo bông gòn', gia: 1597000, anhSP: 'keo.jpg', moTaSP: 'Bó hoa tông hồng.' },
        { maSanPham: 67, tenSanPham: 'Giấc mơ xanh', gia: 850000, anhSP: 'giacmoxanh.jpg', moTaSP: 'Bó hoa tông xanh.' },
        { maSanPham: 68, tenSanPham: 'Đong đầy', gia: 1597000, anhSP: 'dongday.jpg', moTaSP: 'Bó hoa cao cấp.' },
        { maSanPham: 69, tenSanPham: 'Magnificent', gia: 3300000, anhSP: 'mag.jpg', moTaSP: 'Bó hoa cao cấp.' },
        { maSanPham: 70, tenSanPham: 'Lời yêu đầu', gia: 3570000, anhSP: 'loiyeudau.jpg', moTaSP: 'Bó hoa tặng người thương.' },
        { maSanPham: 71, tenSanPham: 'Dreamlike', gia: 1590000, anhSP: 'dreamlike.jpg', moTaSP: 'Bó hoa cao cấp.' },
        { maSanPham: 101, tenSanPham: 'Hoa hồng đỏ', gia: 350000, anhSP: 'hoahong.jpg', moTaSP: 'Bó hoa hồng đỏ cho dịp Valentine.' },
        { maSanPham: 103, tenSanPham: 'Hoa sinh nhật pastel', gia: 480000, anhSP: 'sn1.jpg', moTaSP: 'Lẵng hoa sinh nhật tông pastel.' }
    ];

    function normalizeSearchText(value) {
        return String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function normalizeCaseText(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
    }

    function productMatchesQuery(product, rawQuery) {
        var query = normalizeCaseText(rawQuery);
        var productName = normalizeCaseText(product && product.tenSanPham);

        if (!query) {
            return false;
        }

        if (/^[a-z0-9 ]$/.test(query)) {
            return productName.includes(query);
        }

        return productName.includes(query)
            || normalizeSearchText(product && product.tenSanPham).includes(normalizeSearchText(query));
    }

    $scope.getProductImageUrl = function (product) {
        var imageValue = product && product.anhSP ? String(product.anhSP).trim() : '';
        var imageMap = {
            'hoa-hong-do.jpg': 'hoahong.jpg',
            'hoa-sinh-nhat.jpg': 'sn1.jpg',
            'teddy-bear.jpg': 'gau1.jpg'
        };

        if (!imageValue) {
            return '/assets/images/products/hoahong.jpg';
        }

        if (/^(https?:|data:|\/)/i.test(imageValue)) {
            return imageValue;
        }

        imageValue = imageMap[imageValue.toLowerCase()] || imageValue;
        return '/assets/images/products/' + encodeURIComponent(imageValue);
    };

    $scope.useFallbackProductImage = function ($event) {
        if ($event && $event.target) {
            $event.target.src = '/assets/images/products/hoahong.jpg';
        }
    };

    $scope.formatProductPrice = function (value) {
        var price = Number(value);
        if (isNaN(price)) {
            return value || '';
        }

        return price.toLocaleString('vi-VN') + ' VND';
    };

    $scope.openSearchProduct = function (product) {
        if (!product) {
            return;
        }

        try {
            sessionStorage.setItem('DahlaSelectedProduct', JSON.stringify(product));
        } catch (error) {
            // Ignore storage errors; product id remains in the URL.
        }

        window.location.assign('/pages/products/product-detail.html?id=' + encodeURIComponent(product.maSanPham || ''));
    };

    $scope.getSanPham = function () {
        $http({
            method: "GET",
            url: apiUrl('/api-user/SanPham/get-all-sp')
        }).then(function (response) {
            var apiProducts = Array.isArray(response.data) ? response.data : [];
            var productMap = {};
            searchSeedProducts.concat(apiProducts).forEach(function (product) {
                if (!product) {
                    return;
                }

                var key = product.maSanPham !== undefined && product.maSanPham !== null
                    ? String(product.maSanPham)
                    : normalizeSearchText(product.tenSanPham);
                productMap[key] = Object.assign({}, productMap[key] || {}, product);
            });
            $scope.sanPhamItem = Object.keys(productMap).map(function (key) {
                return productMap[key];
            });
            $scope.searchProducts();
        }).catch(function () {
            $scope.sanPhamItem = searchSeedProducts.slice();
            $scope.searchProducts();
        });
    };

    $scope.getSanPham();

    $scope.searchProducts = function () {
        var query = normalizeCaseText($scope.searchQuery);
        $scope.hasSearched = Boolean(query);
        if (!query) {
            $scope.filteredProducts = [];
            return;
        }

        $scope.filteredProducts = $scope.sanPhamItem
            .filter(function (product) {
                return productMatchesQuery(product, $scope.searchQuery);
            })
            .slice(0, 12);
    };
});

app.controller('InvoiceController', function ($scope, $http, $window) {
    function parsePrice(value) {
        if (typeof value === 'number') {
            return value;
        }

        var digits = String(value || '').replace(/[^\d]/g, '');
        return Number(digits) || 0;
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
            var quantity = parseInt(item.quantity, 10) || 1;
            return {
                MaChiTietHD: generateAutoCode() + 1,
                SLSP: quantity,
                Gia: parsePrice(item.price),
                SoTienGiam: 0,
                MaHD: maHD,
                MaSanPham: parseInt(item.id, 10),
                MaVoucher: null
            };
        });

        var totalAmount = 0;
        Object.values(listCart).forEach(function (item) {
            var quantity = parseInt(item.quantity, 10) || 1;
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
            try {
                var recentOrders = JSON.parse(localStorage.getItem('DahlaRecentOrders') || '[]');
                if (!Array.isArray(recentOrders)) {
                    recentOrders = [];
                }

                recentOrders.unshift(Object.assign({}, invoiceData, {
                    localCartItems: Object.values(listCart),
                    savedAt: new Date().toISOString()
                }));
                localStorage.setItem('DahlaRecentOrders', JSON.stringify(recentOrders.slice(0, 20)));
            } catch (error) {
                console.warn('Không thể lưu đơn hàng local:', error);
            }
            alert('Hóa đơn đã được tạo thành công!');
            localStorage.removeItem("DatHang");
            $window.location.href = '/pages/account/orders.html';
        }).catch(function (error) {
            console.error('Lỗi khi tạo hóa đơn:', error);
            alert('Đã xảy ra lỗi khi tạo hóa đơn. Vui lòng thử lại!');
        });
    };
});
