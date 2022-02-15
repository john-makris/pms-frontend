import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { ChangePersonalDetailsDialogService } from './services/change-personal-details-dialog.service';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser!: AuthUser;
  isAdmin: boolean = false;
  roles: string = '';

  constructor(private authService: AuthService,
    private formBuilder: FormBuilder,
    private changePersonalDetailsDialogService: ChangePersonalDetailsDialogService) { }

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      username: [''],
      firstname: [''],
      lastname: [''],
      email: [''],
      roleNames: [''],
      department: ['']
    });
    this.authService.user
    .pipe(first())
    .subscribe((currentUser: AuthUser | null) =>  {
      if (currentUser) {
        this.currentUser = currentUser;
        this.isAdmin = false;
        currentUser.roles.forEach((roleName: string) => {
          if (this.roles !== '') {
            this.roles = this.roles + ', ';
          }
          if (roleName.includes('ROLE_ADMIN')) {
            this.roles = this.roles + 'Admin';
            this.isAdmin = true;
          }
          if (roleName.includes('ROLE_TEACHER')) {
            this.roles = this.roles + 'Teacher';
          }

          if (roleName.includes('ROLE_STUDENT')) {
            this.roles = this.roles + 'Student';
          }

          if (roleName.includes('ROLE_SECRETARY')) {
            this.roles = this.roles + 'Secretary';
          }
        });

        this.profileForm.patchValue({
          username: this.currentUser.username,
          firstname: this.currentUser.firstname,
          lastname: this.currentUser.lastname,
          email: this.currentUser.email,
          roleNames: this.roles,
          department: this.currentUser.department !== null ? this.currentUser.department.name : ''
        });
      }
    })
  }

  get f() { return this.profileForm.controls; }

  changePassword() {
    this.changePersonalDetailsDialogService.changePersonalDetails(this.currentUser);
  }


}