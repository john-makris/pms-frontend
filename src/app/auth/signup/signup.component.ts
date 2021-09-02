import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  hide: boolean = true;
  isLoading: boolean = false;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      username: new FormControl('', { validators: [Validators.required, Validators.maxLength(25)]
      }),
      email: new FormControl('', { validators: [Validators.required, Validators.email, Validators.maxLength(20)]
      }),
      password: new FormControl('', { validators: [Validators.required, Validators.minLength(10), Validators.maxLength(18)]})
    });
  }

  get f() { return this.signupForm.controls; }

  onSubmit(): void {
    if(this.signupForm.invalid) {
      return;
    }
    const username = this.signupForm.value.username;
    const email = this.signupForm.value.email;
    const password = this.signupForm.value.password;
    this.isLoading = true;
    
    this.authService.signup(username, email, password).subscribe(
      data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.isLoading = false;
        this.resetForm();
        this.onLogin();
      },
      err => {
        console.log(err);
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
        this.isLoading = false;
      }
    );
  }

  onLogin() {
    this.router.navigate(['../login'], { relativeTo: this.route });
  }

  resetForm() {
    this.signupForm.reset();
  }

}