import { Routes } from '@angular/router';
import { AdminMainComponent } from './core/layout/admin-main/admin-main.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { ProductsManagementComponent } from './features/products/pages/products-management/products-management.component';
import { NewProductComponent } from './features/products/pages/new-product/new-product.component';
import { CompanyManagementComponent } from './features/companies/pages/company-management/company-management.component';
import { EditCompanyComponent } from './features/companies/pages/edit-company/edit-company.component';
import { UsersManagementComponent } from './features/users/pages/users-management/users-management.component';
import { CategoryManagementComponent } from './features/category/pages/category-management/category-management.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { EditProductComponent } from './features/products/pages/edit-product/edit-product.component';
import {ProductDetailsComponent} from './features/products/pages/product-details/product-details.component';
import {CompanyDetailsComponent} from './features/companies/pages/company-details/company-details.component';


export const routes: Routes = [
  {
    path: 'auth',
    component: LoginComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  {
    path: '',
    component: AdminMainComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'products', component: ProductsManagementComponent },
      { path: 'products/new', component: NewProductComponent },
      { path: 'products/details/:id', component: ProductDetailsComponent },
      { path: 'products/:id', component: EditProductComponent },
      { path: 'companies', component: CompanyManagementComponent },
      { path: 'companies/:id', component: EditCompanyComponent },
      { path: 'companies/details/:id', component: CompanyDetailsComponent },
      { path: 'categories', component: CategoryManagementComponent },
      { path: 'users', component: UsersManagementComponent },
    ],
  },
  {
    path: '**',
    redirectTo: '/'
  },

];
