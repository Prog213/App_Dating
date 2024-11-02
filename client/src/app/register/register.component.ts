import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  @Output() cancelRegister = new EventEmitter();
  private accountService = inject(AccountService);
  model: { username: string; password: string } = {
    username: '',
    password: '',
  };

  register() {
    this.accountService.register(this.model).subscribe({
      next: (response) => {
        console.log(response);
        this.cancel();
      },
      error: (error) => console.log(error),
    });
  }

  cancel() {
    this.cancelRegister.emit();
  }
}
