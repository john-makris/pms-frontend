import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { ActiveCourse } from '../active-course.model';
import { ActiveCourseService } from '../active-course.service';

@Component({
  selector: 'app-active-course-detail',
  templateUrl: './active-course-detail.component.html',
  styleUrls: ['./active-course-detail.component.css']
})
export class ActiveCourseDetailComponent implements OnInit, OnDestroy {
  id!: number;
  activeCourse!: ActiveCourse;
  private ensureDialogSubscription!: Subscription;
  ensureDialogStatus!: boolean;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private activeCourseService: ActiveCourseService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService) { }

  ngOnInit(): void {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.activeCourseService.getActiveCourseByCourseId(this.id)
          .pipe(first())
          .subscribe((x: ActiveCourse) => {
            this.activeCourse = x;
          });
      }
    );
  }

  editActiveCourse() {
    this.router.navigate(['/active-courses/edit/', this.id], { relativeTo: this.route });
  }

  deleteActiveCourse(id: number) {
    if (!this.activeCourse) return;
    this.ensureDialogService.openDialog('will be Deleted', this.activeCourse.course.name);
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            this.activeCourse.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.activeCourseService.deleteActiveCourseById(id)
                .pipe(first())
                .subscribe(() => {
                  this.activeCourse.isDeleting = false;
                  this.snackbarService.success('Course deleted');
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
  }
}