import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { UserResponseData } from 'src/app/users/common/payload/response/userResponseData.interface';
import { GroupStudentService } from '../group-student.service';

@Component({
  selector: 'app-group-student-detail',
  templateUrl: './group-student-detail.component.html',
  styleUrls: ['./group-student-detail.component.css']
})
export class GroupStudentDetailComponent implements OnInit, OnDestroy {
  studentId!: number;
  classGroupId!: number;
  studentOfGroup!: UserResponseData;
  ensureDialogStatus!: boolean;
  classGroupTable: boolean = false;

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  private ensureDialogSubscription!: Subscription;
  classGroupTableLoadedSubscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private groupStudentService: GroupStudentService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService,
    private authService: AuthService) { }

  ngOnInit(): void {

    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.currentUserId = this.currentUser.id;
        console.log("Current User Id: "+this.currentUserId);
        this.showAdminFeatures = this.currentUser.roles.includes('ROLE_ADMIN');
        this.showTeacherFeatures = this.currentUser.roles.includes('ROLE_TEACHER');
        this.showStudentFeatures = this.currentUser.roles.includes('ROLE_STUDENT');
      }
    });

    this.classGroupTableLoadedSubscription = this.groupStudentService.groupStudentTableLoadedState
    .subscribe((tableStatus: boolean) => {
      if (tableStatus) {
        this.classGroupTable = tableStatus;
      } else {
        this.router.navigate(['/students-of-groups'], { relativeTo: this.route});
      }
    });

    this.route.params
      .subscribe(
        (params: Params) => {
          this.studentId = params['studentId'];
          this.classGroupId = params['classGroupId'];
          this.groupStudentService.getStudentOfGroup(this.studentId, this.classGroupId, this.currentUserId)
          .pipe(first())
          .subscribe(
            (currentStudentOfGroup: UserResponseData) => {
            if (currentStudentOfGroup) {
              this.studentOfGroup = currentStudentOfGroup;
              console.log("Group Student Details: "+JSON.stringify(this.studentOfGroup));
            } else {
              this.router.navigate(['/students-of-groups'], { relativeTo: this.route});
            }
          },
          (err: any) => {
            this.router.navigate(['/students-of-groups'], { relativeTo: this.route});
          });
      }
    );
  }
  
  deleteGroupStudent(studentId: number, classGroupId: number) {
    if (!this.studentOfGroup) return;
    this.ensureDialogService.openDialog('will be deleted from group', 'Student '+this.studentOfGroup.username, 'delete');
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            //this.classGroup.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.groupStudentService.deleteGroupStudentByClassGroupIdAndStudentId(classGroupId, studentId, this.currentUserId)
                .pipe(first())
                .subscribe(() => {
                  //this.classGroup.isDeleting = false;
                  this.snackbarService.success('Student of Group deleted');
                  this.router.navigate(['../../../'], { relativeTo: this.route });
                });
          }
        }
      );
  }
  
  onCancel() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    if(this.ensureDialogSubscription) {
      this.ensureDialogSubscription.unsubscribe();
    }
    if(this.classGroupTableLoadedSubscription) {
      this.classGroupTableLoadedSubscription.unsubscribe();
    }
  }
}