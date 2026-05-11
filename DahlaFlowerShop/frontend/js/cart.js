$(document).ready(function () {
    // Lấy giỏ hàng từ localStorage
    var DatHang = JSON.parse(localStorage.getItem("DatHang")) || {};

    // Kiểm tra nếu DatHang không phải là đối tượng hợp lệ
    if (typeof DatHang !== 'object') {
        DatHang = {}; // Khởi tạo lại nếu dữ liệu không hợp lệ
    }

    function parseMoney(value) {
        if (typeof value === 'number') {
            return value;
        }

        var digits = String(value || '').replace(/[^\d]/g, '');
        return Number(digits) || 0;
    }

    function formatMoney(value) {
        return (Number(value) || 0).toLocaleString('vi-VN') + ' VND';
    }

    // Hàm để hiển thị giỏ hàng
    function renderCart() {
        // Xóa nội dung cũ của #content
        $("#content").empty();

        // Tạo bảng giỏ hàng
        let cartHTML = `
            <table id="cart-table" border="1" style="width: 100%; text-align: left;">
                <thead>
                    <tr>
                        <th>Ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let total = 0;

        // Duyệt qua từng sản phẩm trong DatHang
        $.each(DatHang, function (id, product) {
            const { photo, name, price, quantity } = product;
            const itemPrice = parseMoney(price);
            const itemQuantity = parseInt(quantity, 10) || 1;
            const itemTotal = itemPrice * itemQuantity; // Tổng giá trị sản phẩm
            total += itemTotal;

            // Thêm hàng sản phẩm vào bảng
            cartHTML += `
                <tr>
                    <td><img src="${photo}" alt="${name}" style="width: 50px; height: 50px;"></td>
                    <td>${name}</td>
                    <td>${formatMoney(itemPrice)}</td>
                    <td>${itemQuantity}</td>
                    <td>${formatMoney(itemTotal)}</td>
                    <td><button class="btn-delete" data-id="${id}">Xóa</button></td>
                </tr>
            `;
        });

        cartHTML += `
                </tbody>
            </table>
            <div id="cart-total" style="text-align: right; font-weight: bold; margin-top: 10px;">
                Tổng cộng: ${formatMoney(total)}
            </div>
        `;

        // Nếu giỏ hàng trống, hiển thị thông báo
        if (Object.keys(DatHang).length === 0) {
            cartHTML = `<p style="text-align: center;">Giỏ hàng của bạn trống!</p>`;
        }

        // Đưa nội dung giỏ hàng vào #content
        $("#content").html(cartHTML);
    }

    // Gọi hàm hiển thị giỏ hàng khi trang được tải
    renderCart();

    // Xử lý sự kiện xóa sản phẩm khỏi giỏ hàng
    $(document).on("click", ".btn-delete", function () {
        const id = $(this).data("id");

        // Xóa sản phẩm khỏi đối tượng DatHang
        delete DatHang[id];

        // Cập nhật lại localStorage
        localStorage.setItem("DatHang", JSON.stringify(DatHang));

        // Cập nhật lại giao diện giỏ hàng
        renderCart();
    });
});
