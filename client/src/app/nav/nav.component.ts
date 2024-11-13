import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, BsDropdownModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent {
  private accountService = inject(AccountService);
  private router = inject(Router);
  toast = inject(ToastrService);
  user = this.accountService.currentUser.asReadonly();

  model: { username: string; password: string } = {
    username: '',
    password: '',
  };

  login() {
    this.accountService.login(this.model).subscribe({
      next: _ => {
        this.router.navigateByUrl('/members');
      },
      error: error => this.toast.error(error.error),
    });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
