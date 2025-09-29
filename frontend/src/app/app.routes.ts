import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { permissionGuard } from './shared/guards/permission.guard';

// Layouts
import { UserLayout } from './features/layout/user-layout';
import { AdminLayout } from './admin/layout/admin-layout';

// Features (customer)
import { HomeComponent } from './features/home/home';
import { Login } from './features/login/login';
import { RegisterComponent } from './features/register/register';
import { ProfileComponent } from './features/profile/profile';
import { ProductsComponent } from './features/products/products';
import { ProductDetailComponent } from './features/product_detail/product_detail';
import { ClientChatPage } from './features/chat/client-chat';
import { ForgotPasswordComponent } from './features/forgot-password/forgot-password';
import { CheckoutPageComponent  } from './features/checkout/checkout-page';
import { OrderSuccessPageComponent } from './features/checkout/order-success-page';
import { AboutComponent } from './features/about/about';
import { MyOrdersComponent } from './features/orders/my-orders';
import { OrderDetailComponent } from './features/orders/order-detail';


// Admin
import { Dashboard } from './admin/dashboard/dashboard';

// Categories
import { CategoriesAdminListComponent } from './admin/categories-admin/categories-admin-list.component';
import { CategoriesAdminAddComponent } from './admin/categories-admin/categories-admin-add.component';
import { CategoriesAdminEditComponent } from './admin/categories-admin/categories-admin-edit.component';

// Products
import { ProductsAdminComponent } from './admin/products-admin/products-admin';
import { ProductAdminFormComponent } from './admin/products-admin/product-admin-form';

// Brands
import { BrandsAdminListComponent } from './admin/brands-admin/brand-admin-list';
import { BrandAdminFormComponent } from './admin/brands-admin/brand-admin-form';

// Suppliers
import { SupplierAdminListComponent } from './admin/suppliers-admin/supplier-admin-list';
import { SupplierAdminFormComponent } from './admin/suppliers-admin/supplier-admin-form';

// Imports
import { ImportListComponent } from './admin/imports-admin/import-list.component';
import { ImportAddComponent } from './admin/imports-admin/import-add.component';
import { ImportEditComponent } from './admin/imports-admin/import-edit.component';
import { ImportDetailComponent } from './admin/imports-admin/import-detail.component';

// Coupons
import { CouponAdminListComponent } from './admin/coupons-admin/coupon-admin-list';
import { CouponAdminFormComponent } from './admin/coupons-admin/coupon-admin-form';

// Shipping vouchers
import { ShippingCarrierListComponent } from './admin/shipping-rates/shipping-carrier-list';
import { ShippingCarrierFormComponent } from './admin/shipping-rates/shipping-carrier-form';
import { ShippingServiceListComponent } from './admin/shipping-rates/shipping-service-list';

// Live chat
import { AdminLivechatPage } from './admin/livechat/admin-livechat';
// import { LiveChatAdminComponent } from './admin/live-chat/live-chat-admin';
import { WishlistComponent } from './features/wishlist/wishlist.component';
// mânger cusyomer
import { CustomersAdminComponent } from './admin/customers-admin/customers-admin';


export const routes: Routes = [
  // ===== Customer layout =====
  {
    path: '',
    component: UserLayout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'login', component: Login },
      { path: 'register', component: RegisterComponent },
      { path: 'about', component: AboutComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'product/:id', component: ProductDetailComponent },
      { path: 'chat', component: ClientChatPage },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: '', component: HomeComponent },
      { path: 'wishlist', component: WishlistComponent },
      { path: 'chat', canActivate: [authGuard], component: ClientChatPage },
      { path: 'order-success', component: OrderSuccessPageComponent },
 // 👇 ĐƠN HÀNG KHÁCH
      { path: 'order',       canActivate: [authGuard], component: MyOrdersComponent },
      { path: 'order/:id',   canActivate: [authGuard], component: OrderDetailComponent },
      { path: 'history',     canActivate: [authGuard], component: MyOrdersComponent, data: { mode: 'history' } },
      // ===== Cart + chekcout + Orders (customer)
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/cart/cart').then(m => m.CartComponent), // ✅ sửa đúng export name
      },

      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/checkout/checkout-page').then(m => m.CheckoutPageComponent),
      },

    ],
  },

  // ===== Admin layout =====
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },

      // Danh mục
      {
        path: 'categories',
        canActivate: [permissionGuard],
        data: { permissions: ['manage_categories'] },
        children: [
          { path: '', component: CategoriesAdminListComponent },
          { path: 'add', component: CategoriesAdminAddComponent },
          { path: 'edit/:id', component: CategoriesAdminEditComponent },
        ],
      },

      // Sản phẩm
      {
        path: 'products',
        canActivate: [permissionGuard],
        data: { permissions: ['manage_products'] },
        children: [
          { path: '', component: ProductsAdminComponent },
          { path: 'new', component: ProductAdminFormComponent },
          { path: ':id', component: ProductAdminFormComponent },
        ],
      },

      // Thương hiệu
      {
        path: 'brands',
        canActivate: [permissionGuard],
        data: { permissions: ['manage_brands'] },
        children: [
          { path: '', component: BrandsAdminListComponent },
          { path: 'new', component: BrandAdminFormComponent },
          { path: ':id', component: BrandAdminFormComponent },
        ],
      },

      // Phiếu nhập
      {
        path: 'imports',
        canActivate: [permissionGuard],
        data: { permissions: ['manage_imports'] },
        children: [
          { path: '', component: ImportListComponent },
          { path: 'add', component: ImportAddComponent },
          { path: ':id/edit', component: ImportEditComponent },
          { path: ':id/details', component: ImportDetailComponent },
        ],
      },

      // Nhà cung cấp
      {
        path: 'suppliers',
        canActivate: [permissionGuard],
        data: { permissions: ['manage_suppliers'] },
        children: [
          { path: '', component: SupplierAdminListComponent },
          { path: 'new', component: SupplierAdminFormComponent },
          { path: ':id', component: SupplierAdminFormComponent },
        ],
      },

      // Đơn hàng (admin) — dùng loadComponent
      {
        path: 'orders',
        loadComponent: () =>
          import('./admin/orders-admin/orders-admin').then(m => m.OrdersAdminComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./admin/orders-admin/orders-admin').then(m => m.OrdersAdminComponent),
      },

      // Live chat
      {
        path: 'live-chat',
        component: AdminLivechatPage,
        canActivate: [permissionGuard],
        data: { permissions: ['manage_livechat'] },
      },

      // Phiếu giảm giá
      {
        path: 'coupons',
        canActivate: [permissionGuard],
        data: { permissions: ['manage_coupons'] },
        children: [
          { path: '', component: CouponAdminListComponent },
          { path: 'new', component: CouponAdminFormComponent },
          { path: ':id', component: CouponAdminFormComponent },
        ],
      },

      // Phiếu vận chuyển
      {
        path: 'shipping-rates',
        loadChildren: () => import('./admin/shipping-rates/shipping-rates.module')
                              .then(m => m.ShippingRatesModule)
      },

      

      // Báo cáo
      // {
      //   path: 'reports',
      //   canActivate: [permissionGuard],
      //   data: { permissions: ['view_reports'] },
      //   loadComponent: () =>
      //     import('./admin/reports-admin/reports-admin').then(m => m.ReportsAdminComponent),
      // },

      // RBAC - Nhóm người dùng
      {
        path: 'roles',
        canActivate: [permissionGuard],
        data: { permissions: ['manage_users'] },
        loadComponent: () =>
          import('./admin/roles/roles-page').then(m => m.RolesPageComponent),
      },

      // RBAC - Quản lý chức năng
      {
        path: 'role-permissions',
        canActivate: [permissionGuard],
        data: { permissions: ['manage_permission'] },
        loadComponent: () =>
          import('./admin/roles/role-permissions-page').then(m => m.RolePermissionsPageComponent),
      },

      // Settings (nếu muốn ràng buộc quyền riêng, ví dụ: manage_settings)
      // {
      //   path: 'settings',
      //   loadComponent: () =>
      //     import('/home').then(m => m.SettingsPageComponent),
      // },

      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permissions: ['manage_customer'] }, // giữ nguyên key đang dùng ở sidebar
        children: [
          { path: '', component: CustomersAdminComponent }
        ]
      },

      // Imports (duplicated direct routes kept as-is)
      { path: 'imports', component: ImportListComponent },
      { path: 'imports/add', component: ImportAddComponent },
      { path: 'imports/:id/edit', component: ImportEditComponent },
      { path: 'imports/:id/details', component: ImportDetailComponent },
    ],
  },

  // ===== Catch-all =====
  { path: '**', redirectTo: 'home' },
];
