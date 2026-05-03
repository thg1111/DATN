(function (window, document) {
    'use strict';

    function normalizeWhitespace(value) {
        return String(value || '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function setStatus(message, tone) {
        var statusNode = document.getElementById('profileStatus');
        if (!statusNode) {
            return;
        }

        statusNode.textContent = message || '';
        statusNode.className = 'profile-message ' + (tone === 'error' ? 'text-danger' : 'text-success');
    }

    function setAvatarHint(message) {
        var hintNode = document.getElementById('profileAvatarHint');
        if (!hintNode) {
            return;
        }

        hintNode.textContent = message || '';
    }

    function buildAvatarFallback(initials) {
        var fallbackNode = document.createElement('span');
        fallbackNode.className = 'account-avatar-large account-avatar-fallback';
        fallbackNode.textContent = initials;
        return fallbackNode;
    }

    function renderAvatarPreview(value, fallbackName) {
        var previewNode = document.getElementById('profileAvatarPreview');
        if (!previewNode) {
            return;
        }

        var src = window.DahlaAuth && typeof window.DahlaAuth.normalizeAvatarUrl === 'function'
            ? window.DahlaAuth.normalizeAvatarUrl({ anh: value, avatarDataUrl: value })
            : normalizeWhitespace(value);
        var initials = normalizeWhitespace(fallbackName).split(' ').filter(Boolean).map(function (part, index, list) {
            if (list.length === 1) {
                return part.slice(0, 2).toUpperCase();
            }

            return index === 0 || index === list.length - 1 ? part.charAt(0).toUpperCase() : '';
        }).join('').slice(0, 2) || 'U';

        previewNode.innerHTML = '';

        if (!src) {
            previewNode.appendChild(buildAvatarFallback(initials));
            return;
        }

        var imageNode = document.createElement('img');
        imageNode.src = src;
        imageNode.alt = 'Avatar';
        imageNode.className = 'account-avatar-large';
        imageNode.addEventListener('error', function () {
            previewNode.innerHTML = '';
            previewNode.appendChild(buildAvatarFallback(initials));
        }, { once: true });
        previewNode.appendChild(imageNode);
    }

    function fillForm(profile, account) {
        document.getElementById('profileTenTK').value = account.tenTK || '';
        document.getElementById('profileTenND').value = profile.tenND || '';
        document.getElementById('profileEmail').value = account.email || '';
        document.getElementById('profileSdt').value = window.DahlaAuth.formatPhoneDisplay(profile.sdt);
        document.getElementById('profileDiaChi').value = profile.diaChi || '';
        document.getElementById('profileSinhNhat').value = profile.sinhNhat ? String(profile.sinhNhat).slice(0, 10) : '';
        document.getElementById('profileGioiTinh').value = profile.gioiTinh || 'Nam';
        document.getElementById('profileAvatarData').value = profile.anh || '';
        document.getElementById('profileCurrentName').textContent = profile.tenND || account.tenTK || 'Tài khoản Dahla';
        document.getElementById('profileCurrentEmail').textContent = account.email || 'Chưa cập nhật email';
        document.getElementById('profileCurrentPhone').textContent = window.DahlaAuth.formatPhoneDisplay(profile.sdt) || 'Chưa cập nhật số điện thoại';
        document.getElementById('profileCurrentAddress').textContent = profile.diaChi || 'Chưa cập nhật địa chỉ';
        renderAvatarPreview(profile.anh || '', profile.tenND || account.tenTK || '');
        setAvatarHint(window.DahlaAuth.isPlainFilenameAvatar(profile.anh || '')
            ? 'Ảnh đại diện hiện tại vẫn là dữ liệu cũ dạng tên file. Chọn lại ảnh một lần để avatar hiện đúng trên mọi trình duyệt.'
            : '');
    }

    function bindAvatarPicker() {
        var fileInput = document.getElementById('profileAvatarFile');
        var hiddenInput = document.getElementById('profileAvatarData');
        var nameInput = document.getElementById('profileTenND');

        if (!fileInput || !hiddenInput) {
            return;
        }

        fileInput.addEventListener('change', function () {
            var file = fileInput.files && fileInput.files[0];
            if (!file) {
                return;
            }

            var reader = new FileReader();
            reader.onload = function (event) {
                var result = event.target && event.target.result ? event.target.result : '';
                hiddenInput.value = result;
                renderAvatarPreview(result, nameInput ? nameInput.value : '');
                setAvatarHint('');
            };
            reader.readAsDataURL(file);
        });

        if (nameInput) {
            nameInput.addEventListener('input', function () {
                renderAvatarPreview(hiddenInput.value, nameInput.value);
            });
        }
    }

    function initProfilePage() {
        var form = document.getElementById('profileForm');
        if (!form || !window.DahlaAuth) {
            return;
        }

        var session = window.DahlaAuth.getAuthSession();
        if (!session || session.maND === undefined || session.maTK === undefined) {
            window.location.replace(window.DahlaAuth.resolveAppUrl('/pages/auth/login.html'));
            return;
        }

        bindAvatarPicker();

        var currentProfile = null;
        var currentAccount = null;

        Promise.all([
            fetch(window.DahlaAuth.buildApiUrl('/api-admin/NguoiDung/get-by-id/' + encodeURIComponent(session.maND))).then(function (response) {
                if (!response.ok) {
                    throw new Error('Không thể tải hồ sơ người dùng.');
                }

                return response.json();
            }),
            fetch(window.DahlaAuth.buildApiUrl('/api-user/TaiKhoan/get-by-id/' + encodeURIComponent(session.maTK))).then(function (response) {
                if (!response.ok) {
                    throw new Error('Không thể tải tài khoản đăng nhập.');
                }

                return response.json();
            })
        ])
            .then(function (results) {
                currentProfile = results[0] || {};
                currentAccount = results[1] || {};
                fillForm(currentProfile, currentAccount);
            })
            .catch(function (error) {
                setStatus(error.message || 'Không thể tải hồ sơ hiện tại.', 'error');
            });

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!currentProfile || !currentAccount) {
                setStatus('Dữ liệu hồ sơ chưa sẵn sàng để cập nhật.', 'error');
                return;
            }

            var tenND = normalizeWhitespace(document.getElementById('profileTenND').value);
            var email = normalizeWhitespace(document.getElementById('profileEmail').value);
            var sdtValue = normalizeWhitespace(document.getElementById('profileSdt').value);
            var diaChi = normalizeWhitespace(document.getElementById('profileDiaChi').value);
            var sinhNhat = normalizeWhitespace(document.getElementById('profileSinhNhat').value);
            var gioiTinh = normalizeWhitespace(document.getElementById('profileGioiTinh').value) || 'Nam';
            var avatarData = normalizeWhitespace(document.getElementById('profileAvatarData').value);
            var submitButton = document.getElementById('profileSubmit');

            if (!tenND) {
                setStatus('Vui lòng nhập họ tên.', 'error');
                return;
            }

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setStatus('Email chưa đúng định dạng.', 'error');
                return;
            }

            if (!/^0\d{9}$/.test(sdtValue)) {
                setStatus('Số điện thoại phải có 10 số và bắt đầu bằng 0.', 'error');
                return;
            }

            submitButton.disabled = true;
            setStatus('Đang lưu thay đổi...', 'success');

            var userPayload = {
                maND: currentProfile.maND,
                tenND: tenND,
                sinhNhat: sinhNhat || null,
                diaChi: diaChi,
                sdt: parseInt(sdtValue, 10),
                anh: avatarData,
                gioiTinh: gioiTinh
            };

            var accountPayload = {
                maTK: currentAccount.maTK,
                tenTK: currentAccount.tenTK,
                matKhau: currentAccount.matKhau,
                quyen: currentAccount.quyen,
                email: email,
                trangThai: currentAccount.trangThai
            };

            Promise.all([
                fetch(window.DahlaAuth.buildApiUrl('/api-admin/NguoiDung/nd-update'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userPayload)
                }).then(function (response) {
                    if (!response.ok) {
                        throw new Error('Cập nhật hồ sơ người dùng thất bại.');
                    }

                    return response.json().catch(function () {
                        return userPayload;
                    });
                }),
                fetch(window.DahlaAuth.buildApiUrl('/api-user/TaiKhoan/tk-update'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(accountPayload)
                }).then(function (response) {
                    if (!response.ok) {
                        throw new Error('Cập nhật email tài khoản thất bại.');
                    }

                    return response.json().catch(function () {
                        return accountPayload;
                    });
                })
            ])
                .then(function () {
                    currentProfile = Object.assign({}, currentProfile, userPayload);
                    currentAccount = Object.assign({}, currentAccount, accountPayload);
                    fillForm(currentProfile, currentAccount);

                    window.DahlaAuth.saveRegistrationProfile({
                        maND: currentProfile.maND,
                        maTK: currentAccount.maTK,
                        tenTK: currentAccount.tenTK,
                        tenND: tenND,
                        email: email,
                        anh: avatarData,
                        avatarDataUrl: avatarData,
                        diaChi: diaChi,
                        gioiTinh: gioiTinh,
                        sdt: sdtValue
                    });

                    window.DahlaAuth.saveAuthSession({
                        maND: currentProfile.maND,
                        maTK: currentAccount.maTK,
                        tenTK: currentAccount.tenTK,
                        tenND: tenND,
                        email: email,
                        anh: avatarData,
                        avatarDataUrl: avatarData,
                        diaChi: diaChi,
                        gioiTinh: gioiTinh,
                        sdt: sdtValue,
                        quyen: currentAccount.quyen
                    });

                    window.DahlaAuth.showTransientMessage('Đã cập nhật hồ sơ thành công.', 'success');
                    setStatus('Đã lưu thay đổi thành công.', 'success');
                })
                .catch(function (error) {
                    setStatus(error.message || 'Không thể cập nhật hồ sơ.', 'error');
                })
                .finally(function () {
                    submitButton.disabled = false;
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfilePage);
    } else {
        initProfilePage();
    }
})(window, document);
