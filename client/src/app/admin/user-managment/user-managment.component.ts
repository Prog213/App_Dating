import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { User } from '../../models/user.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from '../../modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-managment',
  standalone: true,
  imports: [],
  templateUrl: './user-managment.component.html',
  styleUrl: './user-managment.component.css',
})
export class UserManagmentComponent implements OnInit {
  private adminService = inject(AdminService);
  users: User[] = [];
  private modelService = inject(BsModalService);
  bsModalRef: BsModalRef<RolesModalComponent> =
    new BsModalRef<RolesModalComponent>();

  getUsersWithRoles() {
    this.adminService.getUsersWithRoles().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  openRolesModal(user: User) {
    const initialState = {
      class: 'modal-lg',
      initialState: {
        title: 'User Roles',
        username: user.username,
        selectedRoles: [...user.roles],
        availableRoles: ['Admin', 'Moderator', 'Member'],
        users: this.users,
        rolesUpdated: false
      },
    };

    this.bsModalRef = this.modelService.show(RolesModalComponent, initialState);
    this.bsModalRef.onHide?.subscribe({
      next: () => {
        if (this.bsModalRef.content && this.bsModalRef.content.rolesUpdated) {
          const rolesToUpdate = this.bsModalRef.content.selectedRoles;
          this.adminService
            .updateUserRoles(user.username, rolesToUpdate)
            .subscribe(() => {
              user.roles = [...rolesToUpdate];
            });
        }
      },
    });
  }

  ngOnInit() {
    this.getUsersWithRoles();
  }
}
