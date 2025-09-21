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
import { BrandAdminListComponent } from './admin/brands-admin/brand-admin-list';
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
import { ShipVoucherAdminListComponent } from './admin/shipping-vouchers-admin/ship-voucher-admin-list';
import { ShipVoucherAdminFormComponent } from './admin/shipping-vouchers-admin/ship-voucher-admin-form';

// Live chat
import { AdminLivechatPage } from './admin/livechat/admin-livechat';

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
      { path: 'profile', component: ProfileComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'product/:id', component: ProductDetailComponent },
      { path: 'chat', component: ClientChatPage },
      { path: 'forgot-password', component: ForgotPasswordComponent },
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
          { path: '', component: BrandAdminListComponent },
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

      // Đơn hàng
      // {
      //   path: 'orders',
      //   canActivate: [permissionGuard],
      //   data: { permissions: ['manage_orders'] },
      //   loadComponent: () =>
      //     import('./admin/orders-admin/orders-admin').then(m => m.OrdersAdminComponent),
      // },

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
        path: 'shipping-vouchers',
        canActivate: [permissionGuard],
        data: { permissions: ['manage_shippingvoucher'] },
        children: [
          { path: '', component: ShipVoucherAdminListComponent },
          { path: 'new', component: ShipVoucherAdminFormComponent },
          { path: ':id', component: ShipVoucherAdminFormComponent },
        ],
      },

      // Quản lý khách hàng
      // {
      //   path: 'users',
      //   canActivate: [permissionGuard],
      //   data: { permissions: ['manage_custommer'] },
      //   loadComponent: () =>
      //     import('./admin/users-admin/users-admin').then(m => m.UsersAdminComponent),
      // },

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
    ],
  },

  // ===== Catch-all =====
  { path: '**', redirectTo: 'home' },
];
