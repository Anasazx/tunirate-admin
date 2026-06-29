import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent {

  menuItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: 'dashboard'
    },
    {
      label: 'Products',
      path: '/products',
      icon: 'box'
    },
    {
      label: 'Companies',
      path: '/companies',
      icon: 'building'
    },
    {
      label: 'Categories',
      path: '/categories',
      icon: 'grid'
    },
    {
      label: 'Users',
      path: '/users',
      icon: 'users'
    }
  ];

}
