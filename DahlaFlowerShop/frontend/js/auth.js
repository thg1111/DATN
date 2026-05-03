



document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const previewImage = document.getElementById("previewImage");
    const anhInput = document.getElementById("Anh");

    if (!form || !previewImage || !anhInput) {
        return;
    }

    // Hiển thị preview ảnh
    anhInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImage.src = e.target.result;
                previewImage.style.display = "block";
            };
            reader.readAsDataURL(file);
        } else {
            previewImage.style.display = "none";
        }
    });

    // Kiểm tra form khi nhấn nút đăng ký
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn gửi form nếu không hợp lệ
        let isValid = true;

        // Danh sách các trường cần kiểm tra
        const fields = [
            { id: "TenTK", message: "Vui lòng nhập tên đăng nhập." },
            { id: "MatKhau", message: "Vui lòng nhập mật khẩu." },
            { id: "Email", message: "Vui lòng nhập email hợp lệ.", type: "email" },
            { id: "TenND", message: "Vui lòng nhập họ tên." },
            { id: "SDT", message: "Vui lòng nhập số điện thoại hợp lệ (10-11 số).", type: "phone" },
        ];

        // Kiểm tra từng trường
        fields.forEach((field) => {
            const input = document.getElementById(field.id);
            const value = input.value.trim();

            if (!value || (field.type === "email" && !isValidEmail(value)) || 
                (field.type === "phone" && !isValidPhone(value))) {
                showError(input, field.message);
                isValid = false;
            } else {
                clearError(input);
            }
        });

        // Nếu form hợp lệ, thực hiện đăng ký (hiện tại chỉ log ra console)
        if (isValid) {
            alert("Form hợp lệ. Đang gửi dữ liệu...");
            const formData = new FormData(form); // Thu thập dữ liệu để gửi lên API
            console.log("Dữ liệu form:", Object.fromEntries(formData.entries()));
        }
    });

    // Hiển thị lỗi cho trường nhập
    function showError(input, message) {
        input.classList.add("is-invalid");
        const feedback = input.nextElementSibling;
        if (feedback) feedback.textContent = message;
    }

    // Xóa lỗi khi trường nhập hợp lệ
    function clearError(input) {
        input.classList.remove("is-invalid");
        const feedback = input.nextElementSibling;
        if (feedback) feedback.textContent = "";
    }

    // Hàm kiểm tra email
    function isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Hàm kiểm tra số điện thoại
    function isValidPhone(phone) {
        const phonePattern = /^[0-9]{10,11}$/;
        return phonePattern.test(phone);
    }
    // Hiển thị Toast thông báo lỗi
    function showErrorToast() {
        const toast = new bootstrap.Toast(document.getElementById("errorToast"));
        toast.show();
    }
    // Hiển thị Toast thông báo thành công và chuyển hướng
    function showSuccessToast() {
        const toast = new bootstrap.Toast(document.getElementById("successToast"));
        toast.show();

        // Chuyển hướng sau 2 giây
        setTimeout(() => {
            window.location.href = "TrangChuCuaHang.html";
        }, 2000);
    }
});
