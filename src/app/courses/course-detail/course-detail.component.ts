import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Course } from '../course.model';
import { CourseService } from '../course.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  id!: number;
  course!: Course;
  private ensureDialogSubscription!: Subscription;
  ensureDialogStatus!: boolean;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService) { }

  ngOnInit(): void {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.courseService.getCourseById(this.id)
          .pipe(first())
          .subscribe((x) => {
            this.course = x;
          });
      }
    );
  }

  editCourse() {
    this.router.navigate(['/courses/edit/', this.id], { relativeTo: this.route });
  }

  deleteCourse(id: number) {
    if (!this.course) return;
    this.ensureDialogService.openDialog('will be Deleted', this.course.name);
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            this.course.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.courseService.deleteCourseById(id)
                .pipe(first())
                .subscribe(() => {
                  this.course.isDeleting = false;
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