import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
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

  lectureTableLoadedSubscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private lectureService: LectureService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService) { }

  ngOnInit(): void {
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
          this.lectureService.getLectureById(this.id)
          .pipe(first())
          .subscribe((currentLecture: LectureResponseData) => {
            this.lecture = currentLecture;
            console.log("Lecture Details: "+JSON.stringify(this.lecture));
          });
      }
    );
  }

  editLecture() {
    this.router.navigate(['/lectures/edit/', this.id], { relativeTo: this.route });
  }
  
  deleteLecture(id: number) {
    if (!this.lecture) return;
    this.ensureDialogService.openDialog('will be Deleted', 'Lecture '+this.lecture.courseSchedule.course.name+' '+this.lecture.nameIdentifier);
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            //this.lecture.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.lectureService.deleteLectureById(id)
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