(function (window, document) {
    'use strict';

    var fallbackProducts = {
        '23': { maSanPham: 23, tenSanPham: 'Kiêu sa', gia: 4140000, oldPrice: '4,600,000VND', anhSP: 'kieuxa.jpg', moTaSP: 'Bó hoa Kiêu sa là sự kết hợp của mẫu đơn cùng hoa hồng tông hồng sang trọng.' },
        '31': { maSanPham: 31, tenSanPham: 'Cappybara tịnh tâm', gia: 600000, oldPrice: '660,000 VND', anhSP: 'gau1.jpg', moTaSP: 'Gấu bông Cappybara tịnh tâm, phù hợp làm quà tặng dễ thương.' },
        '32': { maSanPham: 32, tenSanPham: 'Lena nón chuột 40cm', gia: 320000, oldPrice: '360,000 VND', anhSP: 'gau2.jpg', moTaSP: 'Gấu bông Lena nón chuột kích thước 40cm.' },
        '33': { maSanPham: 33, tenSanPham: 'Teddy', gia: 450000, oldPrice: '500,000 VND', anhSP: 'gau3.jpg', moTaSP: 'Gấu bông Teddy mềm mại, dễ thương.' },
        '34': { maSanPham: 34, tenSanPham: 'Jullydoll', gia: 1614000, oldPrice: '1,790,000 VND', anhSP: 'gau4.jpg', moTaSP: 'Gấu bông Jullydoll cao cấp.' },
        '35': { maSanPham: 35, tenSanPham: 'Kuromi', gia: 650000, oldPrice: '720,000 VND', anhSP: 'gau5.jpg', moTaSP: 'Gấu bông Kuromi cá tính.' },
        '36': { maSanPham: 36, tenSanPham: 'BaybyThree Thỏ', gia: 350000, oldPrice: '390,000 VND', anhSP: 'gau6.jpg', moTaSP: 'Gấu bông thỏ đáng yêu.' },
        '37': { maSanPham: 37, tenSanPham: 'Vịt vàng cute', gia: 310000, oldPrice: '350,000 VND', anhSP: 'gau7.jpg', moTaSP: 'Gấu bông vịt vàng cute.' },
        '38': { maSanPham: 38, tenSanPham: 'Loopy', gia: 1990000, oldPrice: '2,200,000 VND', anhSP: 'gau8.jpg', moTaSP: 'Gấu bông Loopy nổi bật.' },
        '45': { maSanPham: 45, tenSanPham: 'Forever Young', gia: 790000, oldPrice: '990,000 VND', anhSP: 'young.jpg', moTaSP: 'Bó hoa Forever Young tông nhẹ nhàng, phù hợp tặng người thân và bạn bè.' },
        '101': { maSanPham: 101, tenSanPham: 'Hoa hồng đỏ', gia: 350000, oldPrice: '390,000 VND', anhSP: 'hoahong.jpg', moTaSP: 'Bó hoa hồng đỏ cho dịp Valentine.' },
        '102': { maSanPham: 102, tenSanPham: 'Gấu bông Teddy', gia: 220000, oldPrice: '250,000 VND', anhSP: 'gau1.jpg', moTaSP: 'Gấu bông quà tặng dễ thương.' },
        '103': { maSanPham: 103, tenSanPham: 'Hoa sinh nhật pastel', gia: 480000, oldPrice: '550,000 VND', anhSP: 'sn1.jpg', moTaSP: 'Lẵng hoa sinh nhật tông pastel.' }
    };

    function formatPrice(value) {
        var number = Number(value);
        if (isNaN(number)) {
            return value || '';
        }
        return number.toLocaleString('vi-VN') + ' VND';
    }

    function imageUrl(value) {
        var image = String(value || '').trim();
        if (!image) {
            return '/assets/images/products/hoahong.jpg';
        }
        if (/^(https?:|data:|\/)/i.test(image)) {
            return image;
        }
        return '/assets/images/products/' + encodeURIComponent(image);
    }

    function getSelectedProduct() {
        var id = new URLSearchParams(window.location.search).get('id');
        var stored = null;
        try {
            stored = JSON.parse(sessionStorage.getItem('DahlaSelectedProduct') || 'null');
        } catch (error) {
            stored = null;
        }
        if (stored && (!id || String(stored.maSanPham) === String(id))) {
            return Object.assign({}, fallbackProducts[String(stored.maSanPham)] || {}, stored);
        }
        return fallbackProducts[String(id)] || null;
    }

    function setText(selector, value) {
        var element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }

    function renderProduct() {
        var product = getSelectedProduct();
        if (!product) {
            return;
        }

        document.title = product.tenSanPham || document.title;
        var image = document.querySelector('.Item1 .imgSP');
        if (image) {
            image.src = imageUrl(product.anhSP);
            image.alt = product.tenSanPham || '';
            image.onerror = function () {
                image.onerror = null;
                image.src = '/assets/images/products/hoahong.jpg';
            };
        }

        setText('.Item2 .product-name', product.tenSanPham || '');
        setText('.Item2 .product-price', formatPrice(product.gia));
        setText('.Item2 .id-product', product.maSanPham || '');

        var description = document.querySelector('.product-description-text');
        if (description) {
            description.textContent = product.moTaSP || '';
        }

        var oldPrice = document.querySelector('.Item2 s');
        if (oldPrice) {
            oldPrice.textContent = product.oldPrice || '';
            oldPrice.style.display = product.oldPrice ? '' : 'none';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderProduct);
    } else {
        renderProduct();
    }
})(window, document);
