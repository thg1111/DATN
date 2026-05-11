(function (window, document) {
    'use strict';

    var RECENT_ORDERS_KEY = 'DahlaRecentOrders';
    var statusNode = document.getElementById('ordersStatus');
    var listNode = document.getElementById('ordersList');

    function parseJson(value, fallback) {
        try {
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function getSession() {
        if (window.DahlaAuth && typeof window.DahlaAuth.getAuthSession === 'function') {
            return window.DahlaAuth.getAuthSession();
        }

        return parseJson(localStorage.getItem('DahlaAuthSession'), null);
    }

    function buildApiUrl(path) {
        if (window.DahlaAuth && typeof window.DahlaAuth.buildApiUrl === 'function') {
            return window.DahlaAuth.buildApiUrl(path);
        }

        if (typeof window.buildApiUrl === 'function') {
            return window.buildApiUrl(path);
        }

        var baseUrl = typeof window.current_url === 'string' ? window.current_url.replace(/\/+$/, '') : 'http://localhost:5075';
        return baseUrl + (path.charAt(0) === '/' ? path : '/' + path);
    }

    function escapeHtml(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatMoney(value) {
        var number = Number(value);
        return isNaN(number) ? escapeHtml(value || '0') : number.toLocaleString('vi-VN') + ' VND';
    }

    function formatDate(value) {
        if (!value) {
            return '';
        }

        var date = new Date(value);
        return isNaN(date.getTime()) ? escapeHtml(value) : date.toLocaleDateString('vi-VN');
    }

    function getDetails(invoice) {
        var details = invoice.listjson_chitiet || invoice.listJsonChiTiet || invoice.chiTietHD || [];
        if (typeof details === 'string') {
            details = parseJson(details, []);
        }

        return Array.isArray(details) ? details : [];
    }

    function normalizeInvoice(invoice) {
        return {
            maHD: invoice.maHD || invoice.MaHD,
            ngayMua: invoice.ngayMua || invoice.NgayMua || invoice.savedAt,
            tongTien: invoice.tongTien || invoice.TongTien || 0,
            trangThai: invoice.trangThai || invoice.TrangThai || 'Đang chờ',
            diaChiGiao: invoice.diaChiGiao || invoice.DiaChiGiao || '',
            maND: invoice.maND || invoice.MaND,
            details: getDetails(invoice),
            localCartItems: Array.isArray(invoice.localCartItems) ? invoice.localCartItems : []
        };
    }

    function getLocalOrders(maND) {
        var orders = parseJson(localStorage.getItem(RECENT_ORDERS_KEY), []);
        if (!Array.isArray(orders)) {
            return [];
        }

        return orders
            .filter(function (order) {
                return String(order.MaND || order.maND || '') === String(maND);
            })
            .map(normalizeInvoice);
    }

    function mergeOrders(apiOrders, localOrders) {
        var map = {};
        localOrders.concat(apiOrders).forEach(function (order) {
            if (!order || !order.maHD) {
                return;
            }

            map[String(order.maHD)] = Object.assign({}, map[String(order.maHD)] || {}, order);
        });

        return Object.keys(map)
            .map(function (key) { return map[key]; })
            .sort(function (a, b) {
                return new Date(b.ngayMua || 0).getTime() - new Date(a.ngayMua || 0).getTime();
            });
    }

    function renderOrder(order) {
        var details = order.details && order.details.length
            ? order.details.map(function (detail) {
                return '<tr><td>' + escapeHtml(detail.maSanPham || detail.MaSanPham || '') + '</td><td>' + escapeHtml(detail.slsp || detail.SLSP || '') + '</td><td>' + formatMoney(detail.gia || detail.Gia || 0) + '</td></tr>';
            }).join('')
            : '<tr><td colspan="3" class="text-center">Chưa có chi tiết sản phẩm từ API</td></tr>';

        return [
            '<section class="account-form-card">',
            '<div class="d-flex flex-wrap justify-content-between gap-2 mb-3">',
            '<div><h3 class="mb-1" style="color:#9f2f49;font-weight:800;">Mã đơn #', escapeHtml(order.maHD), '</h3>',
            '<p class="mb-0" style="color:#7a5560;">Ngày đặt: ', formatDate(order.ngayMua), '</p></div>',
            '<div class="text-end"><strong style="color:#e03a61;font-size:20px;">', formatMoney(order.tongTien), '</strong><br><span>', escapeHtml(order.trangThai), '</span></div>',
            '</div>',
            '<p class="mb-3"><strong>Địa chỉ giao:</strong> ', escapeHtml(order.diaChiGiao || 'Chưa cập nhật'), '</p>',
            '<div class="table-responsive"><table class="table table-bordered mb-0">',
            '<thead class="table-danger"><tr><th>Mã sản phẩm</th><th>Số lượng</th><th>Giá</th></tr></thead>',
            '<tbody>', details, '</tbody>',
            '</table></div>',
            '</section>'
        ].join('');
    }

    function renderOrders(orders) {
        if (!orders.length) {
            statusNode.className = 'alert alert-warning';
            statusNode.textContent = 'Bạn chưa có đơn hàng nào.';
            listNode.innerHTML = '';
            return;
        }

        statusNode.className = 'alert alert-success';
        statusNode.textContent = 'Tìm thấy ' + orders.length + ' đơn hàng.';
        listNode.innerHTML = orders.map(renderOrder).join('');
    }

    function loadOrders() {
        var session = getSession();
        var maND = session && session.maND !== undefined && session.maND !== null ? session.maND : localStorage.getItem('MaND');
        if (!maND) {
            statusNode.className = 'alert alert-warning';
            statusNode.innerHTML = 'Bạn cần <a href="/pages/auth/login.html">đăng nhập</a> để xem đơn hàng đã đặt.';
            return;
        }

        var localOrders = getLocalOrders(maND);
        fetch(buildApiUrl('/api-admin/HoaDon/get-all-hd'))
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Không thể tải danh sách hóa đơn');
                }

                return response.json();
            })
            .then(function (data) {
                var apiOrders = (Array.isArray(data) ? data : [])
                    .filter(function (order) {
                        return String(order.maND || order.MaND || '') === String(maND);
                    })
                    .map(normalizeInvoice);
                renderOrders(mergeOrders(apiOrders, localOrders));
            })
            .catch(function () {
                renderOrders(localOrders);
                if (!localOrders.length) {
                    statusNode.className = 'alert alert-danger';
                    statusNode.textContent = 'Không tải được đơn hàng từ API.';
                }
            });
    }

    loadOrders();
})(window, document);
