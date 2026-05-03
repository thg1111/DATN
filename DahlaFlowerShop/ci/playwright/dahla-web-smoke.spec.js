const { test, expect } = require('@playwright/test');

const apiBaseURL = process.env.API_BASE_URL || 'https://localhost:7114';

async function configureApp(page) {
  await page.addInitScript((baseUrl) => {
    window.APP_API_BASE_URL = baseUrl;
    window.alert = () => {};
    window.confirm = () => true;
  }, apiBaseURL);
}

async function seedSession(page, overrides = {}) {
  await page.addInitScript((session) => {
    localStorage.setItem('DahlaAuthSession', JSON.stringify(session));
    localStorage.setItem('MaND', String(session.maND));
  }, {
    maTK: 1,
    maND: 1,
    tenTK: 'admin',
    quyen: 'Admin',
    email: 'admin@dahla.local',
    tenND: 'CI Admin',
    ...overrides
  });
}

test.beforeEach(async ({ page }) => {
  await configureApp(page);
});

test('home page loads catalog and search UI', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page).toHaveTitle(/Dahla|Trang/i);
  await expect(page.locator('.header')).toBeVisible();
  await expect(page.locator('input[ng-model="searchQuery"]').first()).toBeVisible();
  await expect(page.locator('.btn-spc1').first()).toBeVisible();
});

test('login page authenticates seeded admin', async ({ page }) => {
  await page.goto('/pages/auth/login.html');
  await page.fill('#tenTK', 'admin');
  await page.fill('#matKhau', '123');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await expect.poll(async () => {
    return page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem('DahlaAuthSession') || 'null');
      return session?.tenTK || localStorage.getItem('MaND') || '';
    }).catch(() => '');
  }).not.toBe('');
});

test('cart page renders localStorage cart item', async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => {
    const store = {
      '9901': {
        id: '9901',
        photo: '/assets/images/products/hoahong.jpg',
        name: 'CI Cart Flower',
        price: 199000,
        quantity: 2
      }
    };
    localStorage.setItem('DatHang', JSON.stringify(store));
  });

  await page.goto('/pages/cart.html');
  await expect.poll(async () => {
    return page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('DatHang') || '{}')).length);
  }).toBeGreaterThan(0);
  await expect(page.locator('body')).toContainText(/THÔNG TIN ĐƠN HÀNG|Tạo Hóa Đơn/i);
});

test('profile page accepts an existing session', async ({ page }) => {
  await seedSession(page);
  await page.goto('/pages/account/profile.html');
  await expect(page).not.toHaveURL(/login\.html/);
  await expect(page.locator('form, #profileForm').first()).toBeVisible();
});

test('admin dashboard loads major management tabs', async ({ page }) => {
  await seedSession(page);
  await page.goto('/pages/admin/dashboard.html');
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#danhmuc')).toBeAttached();
  await expect(page.locator('#sanpham')).toBeAttached();
  await expect(page.locator('#taikhoan')).toBeAttached();
  await expect(page.locator('#nguoidung')).toBeAttached();
  await expect(page.locator('#hoadon')).toBeAttached();
  await expect(page.locator('#voucher')).toBeAttached();
});
