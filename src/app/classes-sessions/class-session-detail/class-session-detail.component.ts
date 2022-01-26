import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { StudentsPreviewDialogService } from 'src/app/courses-schedules/course-schedule-detail/services/students-preview-dialog.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { ClassSessionService } from '../class-session.service';
import { ClassSessionResponseData } from '../common/payload/response/classSessionResponseData.interface';

@Component({
  selector: 'app-class-session-detail',
  templateUrl: './class-session-detail.component.html',
  styleUrls: ['./class-session-detail.component.css']
})
export class ClassSessionDetailComponent implements OnInit, OnDestroy {
  id!: number;
  classSession!: ClassSessionResponseData;
  ensureDialogStatus!: boolean;
  classSessionTable: boolean = false;

  space: string = '\xa0';
  delimeter: string = ',' + '\xa0';

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  private ensureDialogSubscription!: Subscription;
  classGroupTableLoadedSubscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private classSessionService: ClassSessionService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService,
    private studentsPreviewDialogService: StudentsPreviewDialogService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.classGroupTableLoadedSubscription = this.classSessionService.classSessionTableLoadedState
    .subscribe((tableStatus: boolean) => {
      if (tableStatus) {
        this.classSessionTable = tableStatus;
      } else {
        this.router.navigate(['/classes-sessions'], { relativeTo: this.route});
      }
    });

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

    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.classSessionService.getClassSessionById(this.id, this.currentUserId)
          .pipe(first())
          .subscribe(
            (currentClassSession: ClassSessionResponseData) => {
            if (currentClassSession) {
              this.classSession = currentClassSession;
              this.classSessionService.classSessionSubject.next(this.classSession);
              console.log("Class Session Details: "+JSON.stringify(this.classSession));
            } else {
              this.router.navigate(['/classes-sessions'], { relativeTo: this.route});
            }
          },
          (error: any) => {
            this.router.navigate(['/classes-sessions'], { relativeTo: this.route});
          });
      },
      (err: any) => {
        this.router.navigate(['/classes-sessions'], { relativeTo: this.route});
      });
  }

  editClassSession() {
    this.router.navigate(['/classes-sessions/edit/', this.id], { relativeTo: this.route });
  }
  
  deleteClassSession(id: number) {
/*    let groupType: string = '';
    if (this.classSession.groupType.name === 'Theory') {
      groupType = 'theories';
    } else {
      groupType = 'labs';
    } */

    if (!this.classSession) return;
    this.ensureDialogService.openDialog('will be Deleted', this.classSession.nameIdentifier
    +' for '+this.classSession.classGroup.courseSchedule.course.name+', '+this.classSession.lecture.nameIdentifier+' ', 'delete');

    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            //this.classGroup.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.classSessionService.deleteClassSessionById(id, this.currentUserId)
                .pipe(first())
                .subscribe(() => {
                  //this.classGroup.isDeleting = false;
                  this.snackbarService.success('Class Session deleted');
                  this.router.navigate(['../../'], { relativeTo: this.route });
                });
          }
        }
      );
  }
  
  previewStudents() {
    this.studentsPreviewDialogService.showStudents({
      searchId: this.classSession.id,
      identifier: 'session'
    });
  }

  onCancel() {
    this.router.navigate(['../../'], { relativeTo: this.route });
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
