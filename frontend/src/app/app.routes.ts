import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';       // nếu file bạn tên home.ts
import { LoginComponent } from './features/login/login';    // nếu file bạn tên login.ts
import { RegisterComponent } from './features/register/register';
import { ProfileComponent } from './features/profile/profile';
import { AuthGuard } from './shared/services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }
];
