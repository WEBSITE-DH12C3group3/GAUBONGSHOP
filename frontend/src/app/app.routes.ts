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

// Admin pages
import { Dashboard } from './admin/dashboard/dashboard';

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
      { path: 'products', component: ProductsComponent }
    
    ]
  },

  // Admin layout (giữ nguyên)
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
