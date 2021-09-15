import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { UserData } from '../common/payload/response/userData.interface';
import { UserResponseData } from '../common/payload/response/userResponseData.interface';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit, OnDestroy {
  id!: number;
  user!: UserResponseData;
  ensureDialogStatus!: boolean;
  delimeter: string = ',' + '\xa0';
  isAdmin: boolean = false;
  currentRoleName: string = '';

  private ensureDialogSubscription!: Subscription;


  constructor(private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService) { }

  ngOnInit(): void {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.userService.getUserById(this.id)
          .pipe(first())
          .subscribe((currentUserData) => {
            this.user = currentUserData;
            this.currentRoleName = '';
            this.user.roles.forEach(role => {
              if (role.name.includes('ROLE_ADMIN')) {
                this.currentRoleName = role.name;
              } else if(role.name.includes('ROLE_TEACHER')) {
                this.currentRoleName = role.name;
              } else {
                this.currentRoleName = role.name;
              }
            });
            if (this.currentRoleName.includes('ROLE_ADMIN')) {
              this.isAdmin = true;
            } else {
              this.isAdmin = false;
            }
          });
      }
    );
  }

  editUser() {
    this.router.navigate(['/users/edit/', this.id], { relativeTo: this.route });
  }

  deleteUser(id: number) {
    if (!this.user) return;
    this.ensureDialogService.openDialog('will be Deleted', this.user.username);
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            console.log("Hallo "+this.ensureDialogStatus);
            this.userService.deleteUserById(id)
                .pipe(first())
                .subscribe(() => {
                  this.snackbarService.success('User deleted');
                  this.router.navigate(['../../'], { relativeTo: this.route });
                });
          }
        }
      );
  }

  onClose() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    if(this.ensureDialogSubscription) {
      this.ensureDialogSubscription.unsubscribe();
    }
  }
}