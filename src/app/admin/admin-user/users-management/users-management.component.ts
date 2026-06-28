
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserResponse } from '../../../core/model/dto/userDTO/userResponse.model';
import { UserService } from '../../../core/services/userService/user.service';


@Component({
  selector: 'app-users-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css'
})
export class UsersManagementComponent implements OnInit {
  users: UserResponse[] = [];
  loading = false;
  error: string | null = null;
  saving = false;
  selectedUser: UserResponse | null = null;
  draftRole = 'USER';
  roleOptions = ['USER', 'ADMIN'];

  searchTerm: string = '';

  filteredUsers: UserResponse[] = [];

  showRoleModal = false;

  openRoleModal(user: any) {
    this.selectedUser = user;
    this.draftRole = user.globalRole;
    this.showRoleModal = true;
  }

  closeRoleModal() {
    this.showRoleModal = false;
    this.selectedUser = null;
  }


  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.load();
  }

load() {

  this.loading = true;

  this.userService.getAllUsers().subscribe({

    next: (res) => {

      this.users = res;

      this.filteredUsers = res;

      this.loading = false;

    },

    error: (err) => {

      console.error(err);

      this.error = 'Failed to load users';

      this.loading = false;

    }

  });

}

filterUsers(): void {

  const term = this.searchTerm.toLowerCase().trim();

  this.filteredUsers = this.users.filter(u =>

    u.name.toLowerCase().includes(term) ||

    u.email.toLowerCase().includes(term)

  );

}

  selectUser(user: UserResponse) {
    this.selectedUser = user;
    this.draftRole = user.globalRole || 'USER';
  }

  saveRole() {
    if (!this.selectedUser) return;
    this.saving = true;
    this.error = null;

    this.userService.updateUser(this.selectedUser.id, { globalRole: this.draftRole }).subscribe({
      next: () => {
        this.saving = false;
        this.load();
        this.closeRoleModal();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to update role';
        this.saving = false;
      }
    });
  }

  deleteUser(id: number) {
    if (!confirm('Delete user?')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        if (this.selectedUser?.id === id) {
          this.selectedUser = null;
        }
        this.load();
      },
      error: (err) => { console.error(err); this.error = 'Failed to delete user'; }
    });
  }

}
