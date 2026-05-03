(function (window, document) {
    'use strict';

    var AUTH_SESSION_KEY = 'DahlaAuthSession';
    var AUTH_PROFILE_STORE_KEY = 'DahlaAuthProfiles';
    var PENDING_REGISTRATION_KEY = 'DahlaPendingRegistration';
    var WISHLIST_KEY = 'DahlaWishlist';
    var CART_KEY = 'DatHang';
    var DEFAULT_API_BASE = 'http://localhost:5075';
    var SUPPORT_PHONE_RAW = '0364239807';
    var SUPPORT_PHONE_DISPLAY = '0364 239 807';
    var TOAST_CONTAINER_ID = 'dahla-site-toast-container';
    var APP_PATHS = {
        home: '/index.html',
        login: '/pages/auth/login.html',
        register: '/pages/auth/register.html',
        cart: '/pages/cart.html',
        faq: '/pages/faq.html',
        blog: '/pages/blog/index.html',
        weddingBlog: '/pages/blog/wedding-post.html',
        category: '/pages/products/category.html',
        birthday: '/pages/products/birthday.html',
        chocolate: '/pages/products/chocolate.html',
        christmas: '/pages/products/christmas.html',
        teddy: '/pages/products/teddy-bear.html',
        productDetail: '/pages/products/product-detail.html',
        sampleDetail: '/pages/products/sample-detail.html',
        about: '/pages/about.html',
        news: '/pages/news.html',
        careers: '/pages/careers.html',
        wishlist: '/pages/wishlist.html',
        profile: '/pages/account/profile.html'
    };

    function parseJson(value, fallback) {
        if (!value) {
            return fallback;
        }

        try {
            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    }

    function normalizeWhitespace(value) {
        return String(value || '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function toLookupKey(value) {
        return normalizeWhitespace(value)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function resolveAppUrl(path) {
        return new URL(path, window.location.origin).href;
    }

    function buildApiUrl(path) {
        if (typeof window.buildApiUrl === 'function') {
            return window.buildApiUrl(path);
        }

        var baseUrl = typeof window.current_url === 'string' && window.current_url
            ? window.current_url
            : DEFAULT_API_BASE;

        baseUrl = baseUrl.replace(/\/+$/, '');
        return baseUrl + (path.charAt(0) === '/' ? path : '/' + path);
    }

    function getProfileStore() {
        var store = parseJson(localStorage.getItem(AUTH_PROFILE_STORE_KEY), null);
        if (!store || typeof store !== 'object') {
            return { byId: {}, byUsername: {} };
        }

        store.byId = store.byId || {};
        store.byUsername = store.byUsername || {};
        return store;
    }

    function saveProfileStore(store) {
        localStorage.setItem(AUTH_PROFILE_STORE_KEY, JSON.stringify(store));
    }

    function getAuthSession() {
        return parseJson(localStorage.getItem(AUTH_SESSION_KEY), null);
    }

    function buildSession(session) {
        if (!session || typeof session !== 'object') {
            return null;
        }

        var normalized = Object.assign({}, session);
        ['tenTK', 'tenND', 'email', 'anh', 'avatarDataUrl', 'gioiTinh', 'diaChi'].forEach(function (key) {
            if (normalized[key] !== undefined && normalized[key] !== null) {
                normalized[key] = normalizeWhitespace(normalized[key]);
            }
        });

        return normalized;
    }

    function getSessionFingerprint(session) {
        var normalized = buildSession(session);
        if (!normalized) {
            return '';
        }

        return [
            normalized.maND !== undefined && normalized.maND !== null ? String(normalized.maND) : '',
            normalized.tenTK ? normalizeWhitespace(normalized.tenTK).toLowerCase() : ''
        ].join('|');
    }

    function renderInterface() {
        renderAuthLinks();
        renderQuickActionCounts();
    }

    function saveAuthSession(session) {
        var normalized = buildSession(session);
        if (!normalized) {
            return;
        }

        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(normalized));
        if (normalized.maND !== undefined && normalized.maND !== null) {
            localStorage.setItem('MaND', normalized.maND);
        }

        renderInterface();
    }

    function clearAuthSession() {
        localStorage.removeItem(AUTH_SESSION_KEY);
        localStorage.removeItem('MaND');
        renderInterface();
    }

    function performLogout(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        clearAuthSession();
        window.location.replace(resolveAppUrl(APP_PATHS.home));
    }

    function getPendingRegistration() {
        return parseJson(localStorage.getItem(PENDING_REGISTRATION_KEY), null);
    }

    function savePendingRegistration(payload) {
        localStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(payload || {}));
    }

    function clearPendingRegistration() {
        localStorage.removeItem(PENDING_REGISTRATION_KEY);
    }

    function saveRegistrationProfile(profile) {
        if (!profile || typeof profile !== 'object') {
            return;
        }

        var store = getProfileStore();
        var normalized = Object.assign({}, profile);
        var idKey = normalized.maND !== undefined && normalized.maND !== null ? String(normalized.maND) : '';
        var usernameKey = normalized.tenTK ? normalizeWhitespace(normalized.tenTK).toLowerCase() : '';

        if (idKey) {
            store.byId[idKey] = Object.assign({}, store.byId[idKey] || {}, normalized);
        }

        if (usernameKey) {
            store.byUsername[usernameKey] = Object.assign({}, store.byUsername[usernameKey] || {}, normalized);
        }

        saveProfileStore(store);

        var currentSession = getAuthSession();
        if (currentSession && ((idKey && String(currentSession.maND) === idKey) || (usernameKey && normalizeWhitespace(currentSession.tenTK).toLowerCase() === usernameKey))) {
            saveAuthSession(mergeStoredProfile(currentSession));
        }
    }

    function getStoredProfile(session) {
        if (!session) {
            return null;
        }

        var store = getProfileStore();
        var idKey = session.maND !== undefined && session.maND !== null ? String(session.maND) : '';
        var usernameKey = session.tenTK ? normalizeWhitespace(session.tenTK).toLowerCase() : '';

        return store.byId[idKey] || store.byUsername[usernameKey] || null;
    }

    function mergeStoredProfile(session) {
        var normalized = buildSession(session);
        var storedProfile = getStoredProfile(normalized);
        if (!storedProfile) {
            return normalized;
        }

        return Object.assign({}, storedProfile, normalized, {
            avatarDataUrl: normalized.avatarDataUrl || storedProfile.avatarDataUrl || '',
            tenND: normalized.tenND || storedProfile.tenND || '',
            anh: normalized.anh || storedProfile.anh || '',
            email: normalized.email || storedProfile.email || ''
        });
    }

    function isPlainFilenameAvatar(value) {
        return /^[^\/\\]+\.(?:png|jpe?g|webp|gif)$/i.test(normalizeWhitespace(value));
    }

    function buildStaticAvatarUrl(value) {
        if (!isPlainFilenameAvatar(value)) {
            return '';
        }

        return resolveAppUrl('/assets/images/customers/' + encodeURIComponent(value));
    }

    function normalizeAvatarUrl(session) {
        if (!session) {
            return '';
        }

        var storedProfile = getStoredProfile(session);
        var candidates = [
            session.avatarDataUrl,
            session.avatarUrl,
            session.anh,
            storedProfile && storedProfile.avatarDataUrl,
            storedProfile && storedProfile.avatarUrl,
            storedProfile && storedProfile.anh
        ];

        for (var index = 0; index < candidates.length; index += 1) {
            var value = normalizeWhitespace(candidates[index]);
            if (!value) {
                continue;
            }

            if (/^(data:|blob:|https?:)/i.test(value)) {
                return value;
            }

            if (isPlainFilenameAvatar(value)) {
                return buildStaticAvatarUrl(value);
            }
        }

        return '';
    }

    function getDisplayName(session) {
        return session && (session.tenND || session.tenTK || 'T\u00e0i kho\u1ea3n') || 'T\u00e0i kho\u1ea3n';
    }

    function getInitials(name) {
        var tokens = normalizeWhitespace(name).split(' ').filter(Boolean);
        if (!tokens.length) {
            return 'U';
        }

        if (tokens.length === 1) {
            return tokens[0].slice(0, 2).toUpperCase();
        }

        return (tokens[0].charAt(0) + tokens[tokens.length - 1].charAt(0)).toUpperCase();
    }

    function formatPhoneDisplay(value) {
        var digits = String(value || '').replace(/\D/g, '');
        if (!digits) {
            return '';
        }

        return digits.padStart(10, '0');
    }

    function getGuestAuthMarkup() {
        return [
            '<a href="', resolveAppUrl(APP_PATHS.login), '" class="auth-button auth-button-login">\u0110\u0103ng nh\u1eadp</a>',
            '<a href="', resolveAppUrl(APP_PATHS.register), '" class="auth-button auth-button-register">\u0110\u0103ng k\u00fd</a>'
        ].join('');
    }

    function getSignedInAuthMarkup(session) {
        var displayName = escapeHtml(getDisplayName(session));
        var initials = escapeHtml(getInitials(displayName));
        var avatarUrl = normalizeAvatarUrl(session);
        var profileUrl = resolveAppUrl(APP_PATHS.profile);
        var avatarMarkup = avatarUrl
            ? '<img class="auth-user-avatar" src="' + escapeHtml(avatarUrl) + '" alt="' + displayName + '" data-auth-avatar="image">'
            : '<span class="auth-user-avatar auth-user-avatar-fallback">' + initials + '</span>';

        return [
            '<div class="auth-user-shell">',
            '<a href="', profileUrl, '" class="auth-user-chip auth-profile-link" title="M\u1edf trang Ch\u1ed7 t\u00f4i">',
            avatarMarkup,
            '<div class="auth-user-copy">',
            '<span class="auth-user-label">Xin ch\u00e0o,</span>',
            '<strong class="auth-user-name">', displayName, '</strong>',
            '</div>',
            '</a>',
            '<div class="auth-user-actions">',
            '<button type="button" class="auth-button auth-button-logout" data-auth-logout="true">\u0110\u0103ng xu\u1ea5t</button>',
            '</div>',
            '</div>'
        ].join('');
    }

    function renderAuthLinks() {
        var session = mergeStoredProfile(getAuthSession());
        var containers = document.querySelectorAll('.auth-links');
        if (!containers.length) {
            return;
        }

        containers.forEach(function (container) {
            container.innerHTML = session ? getSignedInAuthMarkup(session) : getGuestAuthMarkup();
        });

        document.querySelectorAll('[data-auth-avatar="image"]').forEach(function (image) {
            image.addEventListener('error', function () {
                var parent = image.parentElement;
                if (!parent) {
                    return;
                }

                var fallback = document.createElement('span');
                fallback.className = 'auth-user-avatar auth-user-avatar-fallback';
                fallback.textContent = getInitials(getDisplayName(session));
                parent.replaceChild(fallback, image);
            }, { once: true });
        });

        document.querySelectorAll('[data-auth-logout]').forEach(function (button) {
            if (button.dataset.logoutReady === '1') {
                return;
            }

            button.dataset.logoutReady = '1';
            button.addEventListener('click', performLogout);
        });
    }

    function getCartStore() {
        var store = parseJson(localStorage.getItem(CART_KEY), {});
        return store && typeof store === 'object' ? store : {};
    }

    function getWishlistItems() {
        var items = parseJson(localStorage.getItem(WISHLIST_KEY), []);
        if (Array.isArray(items)) {
            return items;
        }

        if (items && typeof items === 'object') {
            return Object.keys(items).map(function (key) {
                return items[key];
            });
        }

        return [];
    }

    function saveWishlistItems(items) {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(Array.isArray(items) ? items : []));
        renderQuickActionCounts();
    }

    function renderQuickActionCounts() {
        var cartStore = getCartStore();
        var cartCount = Object.keys(cartStore).reduce(function (sum, key) {
            var item = cartStore[key];
            return sum + Number(item && item.quantity ? item.quantity : 0);
        }, 0);
        var wishlistCount = getWishlistItems().length;

        document.querySelectorAll('[data-quick-count="cart"]').forEach(function (badge) {
            badge.textContent = String(cartCount);
        });

        document.querySelectorAll('[data-quick-count="wishlist"]').forEach(function (badge) {
            badge.textContent = String(wishlistCount);
        });
    }

    function showTransientMessage(message, tone) {
        if (!message) {
            return;
        }

        var container = document.getElementById(TOAST_CONTAINER_ID);
        if (!container) {
            container = document.createElement('div');
            container.id = TOAST_CONTAINER_ID;
            container.className = 'site-toast-container';
            document.body.appendChild(container);
        }

        var toast = document.createElement('div');
        toast.className = 'site-toast ' + (tone === 'error' ? 'site-toast-error' : 'site-toast-success');
        toast.textContent = message;
        container.appendChild(toast);

        window.setTimeout(function () {
            toast.classList.add('is-visible');
        }, 10);

        window.setTimeout(function () {
            toast.classList.remove('is-visible');
            window.setTimeout(function () {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 220);
        }, 2600);
    }

    function hydrateUserProfile() {
        var session = getAuthSession();
        if (!session || session.maND === undefined || session.maND === null) {
            renderInterface();
            return;
        }

        var sessionFingerprint = getSessionFingerprint(session);

        fetch(buildApiUrl('/api-admin/NguoiDung/get-by-id/' + encodeURIComponent(session.maND)))
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Kh\u00f4ng th\u1ec3 t\u1ea3i th\u00f4ng tin ng\u01b0\u1eddi d\u00f9ng');
                }

                return response.json();
            })
            .then(function (profile) {
                if (!profile) {
                    renderInterface();
                    return;
                }

                var activeSession = getAuthSession();
                if (getSessionFingerprint(activeSession) !== sessionFingerprint) {
                    renderInterface();
                    return;
                }

                var storedProfile = getStoredProfile(session);
                var merged = Object.assign({}, session, {
                    tenND: profile.tenND || session.tenND || '',
                    diaChi: profile.diaChi || session.diaChi || '',
                    gioiTinh: profile.gioiTinh || session.gioiTinh || '',
                    anh: profile.anh || session.anh || '',
                    sinhNhat: profile.sinhNhat || session.sinhNhat || '',
                    sdt: profile.sdt || session.sdt || ''
                });

                if (storedProfile && storedProfile.avatarDataUrl) {
                    merged.avatarDataUrl = storedProfile.avatarDataUrl;
                    if (isPlainFilenameAvatar(profile.anh)) {
                        merged.anh = storedProfile.avatarDataUrl;
                        fetch(buildApiUrl('/api-admin/NguoiDung/nd-update'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                maND: profile.maND,
                                tenND: profile.tenND || '',
                                sinhNhat: profile.sinhNhat || null,
                                diaChi: profile.diaChi || '',
                                sdt: Number(profile.sdt || 0),
                                anh: storedProfile.avatarDataUrl,
                                gioiTinh: profile.gioiTinh || 'Nam'
                            })
                        }).catch(function () {
                            return null;
                        });
                    }
                }

                saveAuthSession(merged);
                saveRegistrationProfile(merged);
            })
            .catch(function () {
                renderInterface();
            });
    }

    function setLoginMessage(message, isSuccess) {
        var loginMessage = document.querySelector('form[ng-submit="Login()"] + p');
        if (!loginMessage) {
            return;
        }

        loginMessage.textContent = message || '';
        loginMessage.style.color = isSuccess ? '#2f7d4a' : '#9f2f49';
        loginMessage.style.fontWeight = isSuccess ? '700' : '500';
    }

    function handleLoginForm() {
        var form = document.querySelector('form[ng-submit="Login()"]');
        if (!form) {
            return;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var tenTKInput = document.getElementById('tenTK');
            var matKhauInput = document.getElementById('matKhau');
            var tenTK = tenTKInput ? normalizeWhitespace(tenTKInput.value) : '';
            var matKhau = matKhauInput ? matKhauInput.value : '';

            if (!tenTK || !matKhau) {
                setLoginMessage('Vui l\u00f2ng nh\u1eadp t\u00ean \u0111\u0103ng nh\u1eadp v\u00e0 m\u1eadt kh\u1ea9u.', false);
                return;
            }

            fetch(buildApiUrl('/api-user/TaiKhoan/CheckLogin'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tenTK: tenTK,
                    matKhau: matKhau
                })
            })
                .then(function (response) {
                    return response.json().catch(function () {
                        return {};
                    }).then(function (body) {
                        return {
                            ok: response.ok,
                            status: response.status,
                            body: body
                        };
                    });
                })
                .then(function (result) {
                    if (!result.ok) {
                        throw new Error(result.body && result.body.message ? result.body.message : '\u0110\u0103ng nh\u1eadp th\u1ea5t b\u1ea1i. Vui l\u00f2ng ki\u1ec3m tra l\u1ea1i t\u00ean \u0111\u0103ng nh\u1eadp v\u00e0 m\u1eadt kh\u1ea9u.');
                    }

                    var pendingRegistration = getPendingRegistration();
                    if (pendingRegistration && pendingRegistration.tenTK && normalizeWhitespace(pendingRegistration.tenTK).toLowerCase() === tenTK.toLowerCase()) {
                        saveRegistrationProfile({
                            maND: result.body.maND,
                            maTK: result.body.maTK,
                            tenTK: result.body.tenTK || tenTK,
                            tenND: pendingRegistration.tenND || '',
                            email: pendingRegistration.email || result.body.email || '',
                            anh: pendingRegistration.anh || '',
                            avatarDataUrl: pendingRegistration.avatarDataUrl || ''
                        });
                        clearPendingRegistration();
                    }

                    saveAuthSession({
                        maND: result.body.maND,
                        maTK: result.body.maTK,
                        tenTK: result.body.tenTK || tenTK,
                        quyen: result.body.quyen,
                        email: result.body.email
                    });

                    setLoginMessage('\u0110\u0103ng nh\u1eadp th\u00e0nh c\u00f4ng. \u0110ang chuy\u1ec3n trang...', true);
                    window.location.replace(resolveAppUrl(APP_PATHS.home));
                })
                .catch(function (error) {
                    setLoginMessage(error.message || '\u0110\u0103ng nh\u1eadp th\u1ea5t b\u1ea1i. Vui l\u00f2ng ki\u1ec3m tra l\u1ea1i t\u00ean \u0111\u0103ng nh\u1eadp v\u00e0 m\u1eadt kh\u1ea9u.', false);
                });
        }, true);
    }

    function handleRegisterForm() {
        var form = document.getElementById('registerForm');
        if (!form) {
            return;
        }

        var imageInput = document.getElementById('imageND');

        function persistPendingRegistration(avatarDataUrlOverride) {
            var tenTKInput = document.getElementById('tenTK');
            var tenNDInput = document.getElementById('tenND');
            var emailInput = document.getElementById('email');
            var anhInput = document.getElementById('anh');
            var existing = getPendingRegistration() || {};

            savePendingRegistration({
                tenTK: tenTKInput ? normalizeWhitespace(tenTKInput.value) : existing.tenTK || '',
                tenND: tenNDInput ? normalizeWhitespace(tenNDInput.value) : existing.tenND || '',
                email: emailInput ? normalizeWhitespace(emailInput.value) : existing.email || '',
                anh: anhInput ? normalizeWhitespace(anhInput.value) : existing.anh || '',
                avatarDataUrl: avatarDataUrlOverride || existing.avatarDataUrl || ''
            });
        }

        if (imageInput) {
            imageInput.addEventListener('change', function () {
                var file = imageInput.files && imageInput.files[0];
                if (!file) {
                    persistPendingRegistration('');
                    return;
                }

                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    persistPendingRegistration(loadEvent.target && loadEvent.target.result ? loadEvent.target.result : '');
                };
                reader.readAsDataURL(file);
            });
        }

        form.addEventListener('submit', function () {
            persistPendingRegistration('');
        }, true);
    }

    function slugify(value) {
        return normalizeWhitespace(value)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'san-pham';
    }

    function extractProductCardData(trigger) {
        var card = trigger.closest('.vlt, [class*="content-sp"], [class*="content-valentine"], [class*="content-spm"], [class*="content-spc"]');
        if (!card) {
            return null;
        }

        var nameElement = card.querySelector('.product-name');
        if (!nameElement) {
            nameElement = Array.prototype.find.call(card.querySelectorAll('b'), function (element) {
                var text = normalizeWhitespace(element.textContent);
                return text && !/\d/.test(text);
            });
        }

        var priceElement = card.querySelector('.product-price');
        if (!priceElement) {
            priceElement = Array.prototype.find.call(card.querySelectorAll('p'), function (element) {
                return /VND/i.test(element.textContent || '');
            });
        }

        var imageElement = card.querySelector('.imgSP') || card.querySelector('img');
        var idElement = card.querySelector('.id-product');
        var name = nameElement ? normalizeWhitespace(nameElement.textContent) : 'S\u1ea3n ph\u1ea9m';
        var price = priceElement ? normalizeWhitespace(priceElement.textContent) : '';
        var id = idElement ? normalizeWhitespace(idElement.textContent) : slugify(name);
        var photo = imageElement ? imageElement.getAttribute('src') : '';

        return {
            id: id,
            name: name,
            price: price,
            photo: photo,
            quantity: 1
        };
    }

    function addToCart(product) {
        if (!product) {
            return;
        }

        var store = getCartStore();
        var key = product.id;
        if (store[key]) {
            store[key].quantity = Number(store[key].quantity || 0) + 1;
        } else {
            store[key] = product;
        }

        localStorage.setItem(CART_KEY, JSON.stringify(store));
        renderQuickActionCounts();
        showTransientMessage('\u0110\u00e3 th\u00eam "' + product.name + '" v\u00e0o gi\u1ecf h\u00e0ng.', 'success');
    }

    function wireProductActions() {
        document.querySelectorAll('.btn-spc1').forEach(function (button) {
            if (button.dataset.siteActionReady === '1') {
                return;
            }

            button.dataset.siteActionReady = '1';
            var icon = button.querySelector('i');
            if (!icon) {
                return;
            }

            if (icon.classList.contains('bi-cart4')) {
                if (button.classList.contains('btn-cart')) {
                    return;
                }

                button.type = 'button';
                button.title = 'Th\u00eam v\u00e0o gi\u1ecf h\u00e0ng';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    addToCart(extractProductCardData(button));
                });
            }

            if (icon.classList.contains('bi-chat-text')) {
                button.type = 'button';
                button.title = 'Nh\u1eadn t\u01b0 v\u1ea5n nhanh';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    window.location.href = resolveAppUrl(APP_PATHS.faq) + '#support-contact';
                });
            }

            if (icon.classList.contains('bi-eye-fill')) {
                var parentLink = button.closest('a');
                var targetUrl = resolveAppUrl(APP_PATHS.productDetail);
                if (parentLink) {
                    var currentHref = normalizeWhitespace(parentLink.getAttribute('href'));
                    if (!currentHref || currentHref === '#') {
                        parentLink.setAttribute('href', targetUrl);
                    }
                } else {
                    button.type = 'button';
                    button.title = 'Xem chi ti\u1ebft';
                    button.addEventListener('click', function (event) {
                        event.preventDefault();
                        window.location.href = targetUrl;
                    });
                }
            }
        });

        document.querySelectorAll('button.btn-cart').forEach(function (button) {
            var label = normalizeWhitespace(button.textContent).toLowerCase();
            if (label === 'dat nhanh' && button.dataset.quickOrderReady !== '1') {
                button.dataset.quickOrderReady = '1';
                button.type = 'button';
                button.addEventListener('click', function () {
                    window.location.href = 'tel:' + SUPPORT_PHONE_RAW;
                });
            }
        });

        document.querySelectorAll('button').forEach(function (button) {
            if (button.dataset.moreLinkReady === '1') {
                return;
            }

            if (normalizeWhitespace(button.textContent).toLowerCase() === 'xem them') {
                button.dataset.moreLinkReady = '1';
                button.type = 'button';
                button.addEventListener('click', function () {
                    window.location.href = resolveAppUrl(APP_PATHS.blog);
                });
            }
        });
    }

    function enhanceHeaderShell() {
        document.querySelectorAll('.header1 a').forEach(function (link) {
            link.setAttribute('href', resolveAppUrl(APP_PATHS.home));
        });

        document.querySelectorAll('.header3').forEach(function (headerBlock) {
            if (headerBlock.dataset.shellReady === '1') {
                return;
            }

            headerBlock.dataset.shellReady = '1';
            headerBlock.innerHTML = [
                '<div class="header-utility-shell" style="display:flex;align-items:center;gap:10px;width:100%;min-width:0;">',
                '<div class="header-support-card" id="support-contact" style="flex:0 0 270px;width:270px;min-width:270px;max-width:270px;box-sizing:border-box;">',
                '<span class="header-support-icon" style="flex:0 0 42px;"><i class="bi bi-headset"></i></span>',
                '<div class="header-support-copy" style="flex:1 0 auto;min-width:0;max-width:none;">',
                '<span class="header-support-label" style="display:block;white-space:nowrap;">T\u01b0 v\u1ea5n h\u1ed7 tr\u1ee3</span>',
                '<a class="header-support-phone" style="display:block;white-space:nowrap;" href="tel:', SUPPORT_PHONE_RAW, '">', SUPPORT_PHONE_DISPLAY, '</a>',
                '</div>',
                '</div>',
                '<div class="header-account-card">',
                '<div class="auth-links">', getGuestAuthMarkup(), '</div>',
                '</div>',
                '</div>'
            ].join('');
        });

        document.querySelectorAll('.header4').forEach(function (headerBlock) {
            if (headerBlock.dataset.quickReady === '1') {
                return;
            }

            headerBlock.dataset.quickReady = '1';
            headerBlock.innerHTML = [
                '<div class="header-quick-actions">',
                '<a href="', resolveAppUrl(APP_PATHS.about), '#contact" class="header-quick-link" title="\u0110\u1ecba ch\u1ec9 v\u00e0 li\u00ean h\u1ec7">',
                '<i class="bi bi-geo-alt"></i>',
                '</a>',
                '<a href="', resolveAppUrl(APP_PATHS.wishlist), '" class="header-quick-link" title="S\u1ea3n ph\u1ea9m y\u00eau th\u00edch">',
                '<i class="bi bi-heart"></i>',
                '<span class="quick-action-badge" data-quick-count="wishlist">0</span>',
                '</a>',
                '<a href="', resolveAppUrl(APP_PATHS.cart), '" class="header-quick-link" title="Gi\u1ecf h\u00e0ng">',
                '<i class="bi bi-cart3"></i>',
                '<span class="quick-action-badge" data-quick-count="cart">0</span>',
                '</a>',
                '</div>'
            ].join('');
        });
    }

    function decorateNavigationLinks() {
        var textLinkMap = {
            'Xuất xứ': APP_PATHS.about + '#origin',
            'Chủng loại': APP_PATHS.category,
            'Dịp': APP_PATHS.birthday,
            'Blog': APP_PATHS.blog,
            'Blogs': APP_PATHS.blog,
            'Tips': APP_PATHS.faq + '#tips-mua-hoa',
            'Hoa sinh nhật': APP_PATHS.birthday,
            'Hoa cưới': APP_PATHS.weddingBlog,
            'Hoa tốt nghiệp': APP_PATHS.category,
            'Lan hồ điệp': APP_PATHS.category,
            'Hoa khai trương': APP_PATHS.category,
            'Hoa tiệc': APP_PATHS.category,
            'Tuyển dụng': APP_PATHS.careers,
            'Tin tức': APP_PATHS.news,
            'Giới thiệu': APP_PATHS.about,
            'Câu hỏi thường gặp': APP_PATHS.faq,
            'Bó hoa mẫu': APP_PATHS.sampleDetail
        };

        document.querySelectorAll('a').forEach(function (link) {
            var label = normalizeWhitespace(link.textContent);
            if (!label) {
                return;
            }

            if (label === 'Something else here') {
                link.textContent = 'Bó hoa mẫu';
                label = 'Bó hoa mẫu';
            }

            var targetPath = textLinkMap[label];
            if (!targetPath) {
                return;
            }

            var currentHref = normalizeWhitespace(link.getAttribute('href'));
            if (!currentHref || currentHref === '#' || currentHref.indexOf('Something') >= 0) {
                link.setAttribute('href', resolveAppUrl(targetPath));
            }
        });
    }

    function rewritePlaceholderLinks() {
        var textLinkMap = {
            'xuat xu': APP_PATHS.about + '#origin',
            'chung loai': APP_PATHS.category,
            'dip': APP_PATHS.birthday,
            'blog': APP_PATHS.blog,
            'blogs': APP_PATHS.blog,
            'tips': APP_PATHS.faq + '#tips-mua-hoa',
            'hoa sinh nhat': APP_PATHS.birthday,
            'hoa cuoi': APP_PATHS.weddingBlog,
            'hoa tot nghiep': APP_PATHS.category,
            'lan ho diep': APP_PATHS.category,
            'hoa khai truong': APP_PATHS.category,
            'hoa tiec': APP_PATHS.category,
            'hoa ky niem ngay cuoi': APP_PATHS.weddingBlog,
            'gau bong': APP_PATHS.teddy,
            'chocolate': APP_PATHS.chocolate,
            'trai cay': APP_PATHS.category,
            'nen thom': APP_PATHS.category,
            'banh kem': APP_PATHS.category,
            'tuyen dung': APP_PATHS.careers,
            'tin tuc': APP_PATHS.news,
            'gioi thieu': APP_PATHS.about,
            'cau hoi thuong gap': APP_PATHS.faq,
            'bo hoa mau': APP_PATHS.sampleDetail,
            'lien he': APP_PATHS.about + '#contact',
            'chinh sach van chuyen': APP_PATHS.faq,
            'hinh thuc thanh toan': APP_PATHS.faq,
            'bao mat thong tin': APP_PATHS.faq,
            'xu ly khieu nai': APP_PATHS.faq,
            'chinh sach hoan tien': APP_PATHS.faq,
            'cau chuyen ve dahla': APP_PATHS.about,
            'kinh doanh si': APP_PATHS.careers,
            'huong dan chon hoa theo yeu cau': APP_PATHS.faq
        };

        document.querySelectorAll('a').forEach(function (link) {
            var label = normalizeWhitespace(link.textContent);
            if (!label) {
                return;
            }

            var lookupKey = toLookupKey(label);
            if (lookupKey === 'something else here') {
                link.textContent = 'Bo hoa mau';
                lookupKey = 'bo hoa mau';
            }

            var targetPath = textLinkMap[lookupKey];
            if (!targetPath) {
                return;
            }

            link.setAttribute('href', resolveAppUrl(targetPath));
        });
    }

    function handleDocumentClicks() {
        document.addEventListener('click', function (event) {
            var logoutButton = event.target.closest('[data-auth-logout]');
            if (!logoutButton) {
                return;
            }

            performLogout(event);
        });
    }

    function init() {
        enhanceHeaderShell();
        decorateNavigationLinks();
        rewritePlaceholderLinks();
        handleLoginForm();
        handleRegisterForm();
        handleDocumentClicks();
        renderInterface();
        wireProductActions();
        hydrateUserProfile();
    }

    window.DahlaAuth = {
        getAuthSession: getAuthSession,
        saveAuthSession: saveAuthSession,
        clearAuthSession: clearAuthSession,
        saveRegistrationProfile: saveRegistrationProfile,
        mergeStoredProfile: mergeStoredProfile,
        renderAuthLinks: renderAuthLinks,
        hydrateUserProfile: hydrateUserProfile,
        buildApiUrl: buildApiUrl,
        resolveAppUrl: resolveAppUrl,
        getCartStore: getCartStore,
        getWishlistItems: getWishlistItems,
        saveWishlistItems: saveWishlistItems,
        normalizeAvatarUrl: normalizeAvatarUrl,
        isPlainFilenameAvatar: isPlainFilenameAvatar,
        formatPhoneDisplay: formatPhoneDisplay,
        showTransientMessage: showTransientMessage,
        addToCart: addToCart
    };

    window.addEventListener('storage', function () {
        renderInterface();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document);
