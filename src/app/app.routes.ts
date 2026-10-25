import { Routes } from '@angular/router';
import { AdminMainComponent } from './core/layout/admin-main/admin-main.component';
import { adminGuard, guestGuard } from './core/guards/auth.guard';

// Pages are lazy loaded so the first screen loads fast
export const routes: Routes = [

  {
    path: 'auth/login',
    canActivate: [guestGuard],
    title: 'Sign in · ReviewHood Admin',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
  },

  {
    path: '',
    component: AdminMainComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', title: 'Dashboard · ReviewHood Admin', loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      { path: 'products', title: 'Products · ReviewHood Admin', loadComponent: () => import('./features/products/pages/products-management/products-management.component').then(m => m.ProductsManagementComponent) },
      { path: 'products/new', title: 'New product · ReviewHood Admin', loadComponent: () => import('./features/products/pages/product-form/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'products/:id/edit', title: 'Edit product · ReviewHood Admin', loadComponent: () => import('./features/products/pages/product-form/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'products/:id', title: 'Product · ReviewHood Admin', loadComponent: () => import('./features/products/pages/product-details/product-details.component').then(m => m.ProductDetailsComponent) },

      { path: 'companies', title: 'Companies · ReviewHood Admin', loadComponent: () => import('./features/companies/pages/company-management/company-management.component').then(m => m.CompanyManagementComponent) },
      { path: 'companies/new', title: 'New company · ReviewHood Admin', loadComponent: () => import('./features/companies/pages/company-form/company-form.component').then(m => m.CompanyFormComponent) },
      { path: 'companies/:id/edit', title: 'Edit company · ReviewHood Admin', loadComponent: () => import('./features/companies/pages/company-form/company-form.component').then(m => m.CompanyFormComponent) },
      { path: 'companies/:id', title: 'Company · ReviewHood Admin', loadComponent: () => import('./features/companies/pages/company-details/company-details.component').then(m => m.CompanyDetailsComponent) },

      { path: 'categories', title: 'Categories · ReviewHood Admin', loadComponent: () => import('./features/category/pages/category-management/category-management.component').then(m => m.CategoryManagementComponent) },
      { path: 'users', title: 'Users · ReviewHood Admin', loadComponent: () => import('./features/users/pages/users-management/users-management.component').then(m => m.UsersManagementComponent) },
      { path: 'suggestions', title: 'Suggestions · ReviewHood Admin', loadComponent: () => import('./features/suggestions/pages/suggestions-management/suggestions-management.component').then(m => m.SuggestionsManagementComponent) },

      // Old URLs, kept so existing links still work
      { path: 'products/details/:id', redirectTo: 'products/:id' },
      { path: 'companies/details/:id', redirectTo: 'companies/:id' },
    ],
  },

  { path: '**', redirectTo: '' },

];
