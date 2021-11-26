import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseScheduleResponseData } from '../common/payload/response/courseScheduleResponseData.interface';
import { CourseScheduleService } from '../course-schedule.service';
import { StudentsPreviewDialogService } from './services/students-preview-dialog.service';

@Component({
  selector: 'app-course-schedule-detail',
  templateUrl: './course-schedule-detail.component.html',
  styleUrls: ['./course-schedule-detail.component.css']
})
export class CourseScheduleDetailComponent implements OnInit, OnDestroy {
  id!: number;
  courseSchedule!: CourseScheduleResponseData | any;
  private ensureDialogSubscription!: Subscription;
  ensureDialogStatus!: boolean;
  
  theoryHours: number = 0;
  theoryMinutes: number = 0;

  labHours: number = 0;
  labMinutes: number = 0;

  space: string = '\xa0';
  delimeter: string = ',' + '\xa0';

  constructor(private route: ActivatedRoute,
    private router: Router,
    private courseScheduleService: CourseScheduleService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService,
    private studentsPreviewDialogService: StudentsPreviewDialogService) { }

  ngOnInit(): void {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.courseScheduleService.getCourseScheduleById(this.id)
          .pipe(first())
          .subscribe((currentCourseSchedule: CourseScheduleResponseData) => {
            this.courseSchedule = currentCourseSchedule;
            this.courseScheduleService.courseScheduleSubject.next(this.courseSchedule);
            this.calcHoursAndMinutes();
            console.log("Course Schedule Details: "+JSON.stringify(this.courseSchedule));
          });
      }
    );
  }

  editCourseSchedule() {
    this.router.navigate(['/courses-schedules/edit/', this.id], { relativeTo: this.route });
  }

  deleteCourseSchedule(id: number) {
    if (!this.courseSchedule) return;
    this.ensureDialogService.openDialog('will be Deleted', 'Course Schedule '+this.courseSchedule.course.name);
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            //this.courseSchedule.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.courseScheduleService.deleteCourseScheduleById(id)
                .pipe(first())
                .subscribe(() => {
                  //this.courseSchedule.isDeleting = false;
                  this.snackbarService.success('Course Schedule deleted');
                  this.router.navigate(['../../'], { relativeTo: this.route });
                });
          }
        }
      );
  }

  calcHoursAndMinutes() {
    this.theoryHours = Math.floor(this.courseSchedule.theoryLectureDuration / 3600);
    this.theoryMinutes = (Math.floor(this.courseSchedule.theoryLectureDuration % 3600)) / 60;
    this.labHours = Math.floor(this.courseSchedule.labLectureDuration / 3600);
    this.labMinutes = (Math.floor(this.courseSchedule.labLectureDuration % 3600)) / 60;
  }

  previewStudents() {
    this.studentsPreviewDialogService.showStudents(this.courseSchedule.id);
  }

  onCancel() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    if(this.ensureDialogSubscription) {
      this.ensureDialogSubscription.unsubscribe();
    }
  }
}