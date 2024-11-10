import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AccountService } from '../services/account.service';
import { TextInputComponent } from '../forms/text-input/text-input.component';
import { DatePickerComponent } from '../forms/date-picker/date-picker.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, DatePickerComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  @Output() cancelRegister = new EventEmitter();
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  maxDate = new Date();
  validationErrors: string[] | undefined;

  registerForm = this.fb.group({
    gender: ['male'],
    username: ['', Validators.required],
    knownAs: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
    password: [
      '',
      [Validators.required, Validators.minLength(4), Validators.maxLength(8)],
    ],
    confirmPassword: ['', [Validators.required, this.matchValues('password')]],
  });

  ngOnInit() {
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () =>
        this.registerForm.controls['confirmPassword'].updateValueAndValidity(),
    });
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value
        ? null
        : { isMatching: true };
    };
  }

  register() {
    const dob = this.getDateOnly(this.registerForm.get('dateOfBirth')?.value as string | undefined);
    this.registerForm.patchValue({dateOfBirth: dob});

    this.accountService.register(this.registerForm.value).subscribe({
      next: (_) => {
        this.router.navigateByUrl('/members');
      },
      error: (error) => this.validationErrors = error,
    });
  }

  cancel() {
    this.cancelRegister.emit();
  }

  private getDateOnly(dob: string | undefined) {
    if (!dob) return;
    return new Date(dob).toISOString().slice(0, 10);
  } 
}
