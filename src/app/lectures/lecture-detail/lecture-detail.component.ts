import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { LectureResponseData } from '../common/payload/response/lectureResponseData.interface';
import { LectureService } from '../lecture.service';

@Component({
  selector: 'app-lecture-detail',
  templateUrl: './lecture-detail.component.html',
  styleUrls: ['./lecture-detail.component.css']
})
export class LectureDetailComponent implements OnInit {
  id!: number;
  lecture!: LectureResponseData;
  private ensureDialogSubscription!: Subscription;
  ensureDialogStatus!: boolean;
  lectureTable: boolean = false;

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  lectureTableLoadedSubscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private lectureService: LectureService,
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

    this.lectureTableLoadedSubscription = this.lectureService.lectureTableLoadedState
    .subscribe((tableStatus: boolean) => {
      if (tableStatus) {
        this.lectureTable = tableStatus;
      } else {
        this.router.navigate(['/lectures'], { relativeTo: this.route});
      }
    });

    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.lectureService.getLectureById(this.id, this.currentUserId)
          .pipe(first())
          .subscribe((currentLecture: LectureResponseData) => {
            this.lecture = currentLecture;
            console.log("Lecture Details: "+JSON.stringify(this.lecture));
          },
          (err: any) => {
            this.router.navigate(['/lectures'], { relativeTo: this.route});
          });
      }
    );
  }

  editLecture() {
    this.router.navigate(['/lectures/edit/', this.id], { relativeTo: this.route });
  }
  
  deleteLecture(id: number) {
    if (!this.lecture) return;
    this.ensureDialogService.openDialog('will be Deleted', 'Lecture '+this.lecture.courseSchedule.course.name+' '+this.lecture.nameIdentifier, 'delete');
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            //this.lecture.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.lectureService.deleteLectureById(id, this.currentUserId)
                .pipe(first())
                .subscribe(() => {
                  //this.lecture.isDeleting = false;
                  this.snackbarService.success('Lecture deleted');
                  this.router.navigate(['../../'], { relativeTo: this.route });
                });
          }
        }
      );
  }
  
  onCancel() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    if(this.ensureDialogSubscription) {
      this.ensureDialogSubscription.unsubscribe();
    }
    if(this.lectureTableLoadedSubscription) {
      this.lectureTableLoadedSubscription.unsubscribe();
    }
  }
}