$(document).ready(function(){
    var DatHang = JSON.parse(localStorage.getItem("DatHang")) || {}; // Lấy giỏ hàng từ localStorage nếu có

    // Kiểm tra nếu DatHang không phải là đối tượng hợp lệ
    if (typeof DatHang !== 'object') {
        DatHang = {}; // Khởi tạo giỏ hàng nếu dữ liệu không hợp lệ
    }

    var count = 0;

    $(".main").find(".btn-cart").click(function(){
        var id = $(".Item2").find(".id-product").text();
        var photo = $(".Item1").find(".imgSP").attr("src");
        var name = $(".Item2").find(".product-name").text();
        var price = $(".Item2").find(".product-price").text();
        var quantityInput = $("#input-quantity").val(); // Lấy số lượng từ ô nhập liệu
        var quantity = parseInt(quantityInput, 10); // Chuyển sang kiểu số nguyên

        // Kiểm tra nếu sản phẩm đã tồn tại trong giỏ hàng thì tăng số lượng
        if (DatHang.hasOwnProperty(id)) {
            DatHang[id].quantity += quantity;
        } else {
            // Nếu chưa có thì thêm mới sản phẩm vào giỏ hàng
            DatHang[id] = {
                'id': id,
                'photo': photo,
                'name': name,
                'price': price,
                'quantity': quantity
            };
        }

        // Lưu giỏ hàng vào localStorage
        localStorage.setItem("DatHang", JSON.stringify(DatHang));

        // Cập nhật lại số lượng sản phẩm trong giỏ
        $(".badge").text(count + quantity);

        // Hiển thị thông báo về sản phẩm đã thêm vào giỏ hàng
        alert(`Đã thêm ${quantity} sản phẩm "${name}" vào giỏ hàng!`);

        // Xóa ô nhập sau khi thêm vào giỏ hàng
        $("#input-quantity").val("");
    })
})




