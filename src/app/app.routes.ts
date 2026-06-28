import { Routes } from '@angular/router';
import { AdminMainComponent } from './admin-layout/admin-main/admin-main.component';
import { DashboardComponent } from './admin-dashboard/dashboard.component';
import { ProductsManagementComponent } from './admin-product/products-management/products-management.component';
import { NewProductComponent } from './admin-product/new-product/new-product.component';
import { EditProductComponent } from './admin-product/edit-product/edit-product.component';
import { CompanyManagementComponent } from './admin-company/company-management/company-management.component';
import { EditCompanyComponent } from './admin-company/edit-company/edit-company.component';
import { UsersManagementComponent } from './admin-user/users-management/users-management.component';
import { CategoryManagementComponent } from './admin-category/category-management/category-management.component';


export const routes: Routes = [
  {
    path: '',
    component: AdminMainComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'products', component: ProductsManagementComponent },
      { path: 'products/new', component: NewProductComponent },
      { path: 'products/:id', component: EditProductComponent },
      { path: 'companies', component: CompanyManagementComponent },
      { path: 'companies/:id', component: EditCompanyComponent },
      { path: 'categories', component: CategoryManagementComponent },
      { path: 'users', component: UsersManagementComponent },
    ],
  },
  {
    path: '**',
    redirectTo: '/'
  },

];
