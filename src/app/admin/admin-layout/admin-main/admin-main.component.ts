import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { AdminHeaderComponent } from "../admin-header/admin-header.component";

@Component({
  selector: 'app-admin-main',
  imports: [RouterOutlet, AdminSidebarComponent, AdminHeaderComponent],
  templateUrl: './admin-main.component.html',
  styleUrl: './admin-main.component.css'
})
export class AdminMainComponent {

}
