import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hide: boolean = true;
  isLoading: boolean = false;
  isLoggedIn: boolean = false;
  isLoginFailed: boolean = false;
  errorMessage: string = '';
  roles: string[] = [];

  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', { validators: [Validators.required, Validators.maxLength(25)]
      }),
      password: new FormControl('', { validators: [Validators.required/*, Validators.minLength(10), Validators.maxLength(18)*/]})
    });
    this.authService.user.subscribe(currentUser => {
      this.isLoggedIn = !!currentUser;
      if(currentUser) {
        this.roles = currentUser.roles;
      }
    });
  }

  get f() { return this.loginForm.controls; }


  onSubmit() {
    if(this.loginForm.invalid) {
      return;
    }
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    console.log(this.loginForm.value.username);
    this.isLoading = true;
    this.authService.login(username, password).subscribe(
      currentUser => {
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = currentUser.roles;
        this.isLoading = false;
        this.resetForm();
        this.router.navigate(['/home']);
      },
      err => {
        console.log(err);
        this.errorMessage = err;
        this.isLoginFailed = true;
        this.isLoading = false;
      }
    );
  }

  onRegister() {
    this.router.navigate(['../signup'], { relativeTo: this.route });
  }

  resetForm() {
    this.loginForm.reset();
  }
}
