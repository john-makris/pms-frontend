import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { last } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { matchValidator } from 'src/app/common/helpers/passwordMatch.validator';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { UserDetailsRequestData } from 'src/app/profile/common/payload/request/userDetailsRequestData.interface';
import { AuthUser } from 'src/app/users/auth-user.model';
import { UserService } from 'src/app/users/user.service';

@Component({
  selector: 'app-change-personal-details',
  templateUrl: './change-personal-details.component.html',
  styleUrls: ['./change-personal-details.component.css']
})
export class ChangePersonalDetailsComponent implements OnInit, OnDestroy {
  changePersonalDetailsForm!: FormGroup;
  hideOldPassword: boolean = true;
  hideNewPassword: boolean = true;
  hideRetypedNewPassword: boolean = true;

  dialogStarted: boolean = true;

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;

  updateUserDetailsSubscription!: Subscription;

  constructor(
    private dialogRef: MatDialogRef<ChangePersonalDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data : {authUser: AuthUser},
    private formBuilder: FormBuilder,
    private userService: UserService,
    private snackbarService: SnackbarService) {}


  ngOnInit(): void {
    this.currentUser = this.data.authUser;
    this.currentUserId = this.currentUser.id;

    this.changePersonalDetailsForm = this.formBuilder.group({
      oldPassword: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(18)]],
      newPassword: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(18),
        matchValidator('retypedNewPassword', true)]],
      retypedNewPassword: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(18),
        matchValidator('newPassword')]]
    });
  }

  get f() { return this.changePersonalDetailsForm.controls; }

  onSubmit() {
    if (this.currentUser) {
      const userDetailsRequestData: UserDetailsRequestData = {
        username: this.currentUser.username,
        oldPassword: this.changePersonalDetailsForm.value.oldPassword,
        newPassword: this.changePersonalDetailsForm.value.newPassword,
        confirmPassword: this.changePersonalDetailsForm.value.retypedNewPassword
      }

      this.updateUserDetails(this.currentUserId, userDetailsRequestData);
    }
  }

  ok() {
    this.onSubmit();
    //this.close();
  }

  private updateUserDetails(userId: number, userDetailsRequestData: UserDetailsRequestData) {
    this.updateUserDetailsSubscription = this.userService.updateUserDetails(userId, userDetailsRequestData)
      .pipe(last())
      .subscribe(() => {
        this.snackbarService.success('Password changed successfully');
        this.dialogRef.close(null);
      });
  }

  close() {
    this.dialogRef.close(null);
  }

  ngOnDestroy(): void {
    if (this.updateUserDetailsSubscription) {
      this.updateUserDetailsSubscription.unsubscribe();
    }
  }
}
