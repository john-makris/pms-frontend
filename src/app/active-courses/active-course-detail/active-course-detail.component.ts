import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { UserData } from 'src/app/users/common/payload/response/userData.interface';
import { ActiveCourse } from '../active-course.model';
import { ActiveCourseService } from '../active-course.service';
import { ActiveCourseResponseData } from '../common/payload/data/activeCourseData.interface';
import { StudentsPreviewDialogService } from './services/students-preview-dialog.service';

@Component({
  selector: 'app-active-course-detail',
  templateUrl: './active-course-detail.component.html',
  styleUrls: ['./active-course-detail.component.css']
})
export class ActiveCourseDetailComponent implements OnInit, OnDestroy {
  id!: number;
  activeCourse!: ActiveCourseResponseData;
  private ensureDialogSubscription!: Subscription;
  ensureDialogStatus!: boolean;

  space: string = '\xa0';
  delimeter: string = ',' + '\xa0';

  constructor(private route: ActivatedRoute,
    private router: Router,
    private activeCourseService: ActiveCourseService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService,
    private studentsPreviewDialogService: StudentsPreviewDialogService) { }

  ngOnInit(): void {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.activeCourseService.getActiveCourseById(this.id)
          .pipe(first())
          .subscribe((currentActiveCourse: ActiveCourseResponseData) => {
            this.activeCourse = currentActiveCourse;
            console.log("Active Course Details: "+JSON.stringify(this.activeCourse));
          });
      }
    );
  }

  editActiveCourse() {
    this.router.navigate(['/active-courses/edit/', this.id], { relativeTo: this.route });
  }

  deleteActiveCourse(id: number) {
    if (!this.activeCourse) return;
    this.ensureDialogService.openDialog('will be Deleted', 'Active Course '+this.activeCourse.course.name);
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            //this.activeCourse.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.activeCourseService.deleteActiveCourseById(id)
                .pipe(first())
                .subscribe(() => {
                  //this.activeCourse.isDeleting = false;
                  this.snackbarService.success('Active Course deleted');
                  this.router.navigate(['../../'], { relativeTo: this.route });
                });
          }
        }
      );
  }

  previewStudents() {
    this.studentsPreviewDialogService.showStudents(this.activeCourse.id);
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