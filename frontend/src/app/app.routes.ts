import { Routes } from '@angular/router';

// Layouts
import { UserLayout } from './features/layout/user-layout';
import { AdminLayout } from './admin/layout/admin-layout';

// Features customer
import { HomeComponent } from './features/home/home';
import { Login } from './features/login/login';
import { RegisterComponent } from './features/register/register';
import { ProfileComponent } from './features/profile/profile';
import { ProductsComponent } from './features/products/products';
import { ProductDetailComponent } from './features/product_detail/product_detail';

// Admin
import { Dashboard } from './admin/dashboard/dashboard';
import { CategoriesAdminListComponent } from './admin/categories-admin/categories-admin-list.component';
import { CategoriesAdminAddComponent } from './admin/categories-admin/categories-admin-add.component';
import { CategoriesAdminEditComponent } from './admin/categories-admin/categories-admin-edit.component';
import { ProductsAdminComponent } from './admin/products-admin/products-admin';

// Brands admin
import { BrandAdminListComponent } from './admin/brands-admin/brand-admin-list';
import { BrandAdminFormComponent } from './admin/brands-admin/brand-admin-form';

// Suppliers admin
import { SupplierAdminListComponent } from './admin/suppliers-admin/supplier-admin-list';
import { SupplierAdminFormComponent } from './admin/suppliers-admin/supplier-admin-form';

// Coupons admin
import { CouponAdminListComponent } from './admin/coupons-admin/coupon-admin-list';
import { CouponAdminFormComponent } from './admin/coupons-admin/coupon-admin-form';

//shipping-vochers-admin
import { ShipVoucherAdminListComponent } from './admin/shipping-vouchers-admin/ship-voucher-admin-list';
import { ShipVoucherAdminFormComponent } from './admin/shipping-vouchers-admin/ship-voucher-admin-form';


export const routes: Routes = [
  // Customer layout
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
      { path: 'product/:id', component: ProductDetailComponent }
    ]
  },

  // Admin layout
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },

      { path: 'products', component: ProductsAdminComponent },

      {
        path: 'categories',
        children: [
          { path: '', component: CategoriesAdminListComponent },
          { path: 'add', component: CategoriesAdminAddComponent },
          { path: 'edit/:id', component: CategoriesAdminEditComponent }
        ]
      },

      // Brands admin
      {
        path: 'brands',
        children: [
          { path: '', component: BrandAdminListComponent },
          { path: 'new', component: BrandAdminFormComponent },
          { path: ':id', component: BrandAdminFormComponent }
        ]
      },

      // Suppliers admin
      {
        path: 'suppliers',
        children: [
          { path: '', component: SupplierAdminListComponent },
          { path: 'new', component: SupplierAdminFormComponent },
          { path: ':id', component: SupplierAdminFormComponent }
        ]
      },

      // Coupons admin
      { path: 'coupons', children: [
    { path: '', component: CouponAdminListComponent },
    { path: 'new', component: CouponAdminFormComponent },
    { path: ':id', component: CouponAdminFormComponent }
    ]
    },
      { path: 'shipping-vouchers', children: [
    { path: '', component: ShipVoucherAdminListComponent },
    { path: 'new', component: ShipVoucherAdminFormComponent },
    { path: ':id', component: ShipVoucherAdminFormComponent }
        ]
      },
    ]
  },

  // Catch all
  { path: '**', redirectTo: 'home' }
];
