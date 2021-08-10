import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { ActiveCourse } from '../active-course.model';
import { ActiveCourseService } from '../active-course.service';
import { ActiveCourseRequestData } from '../common/payload/request/activeCourseRequestData.interface';

@Component({
  selector: 'app-active-course-edit',
  templateUrl: './active-course-edit.component.html',
  styleUrls: ['./active-course-edit.component.css']
})
export class ActiveCourseEditComponent implements OnInit, OnDestroy {
  activeCourseForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;

  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  routeSubscription!: Subscription;
  activeCourseSubscription!: Subscription;
  createActiveCourseSubscription!: Subscription;
  updateActiveCourseSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private activeCourseService: ActiveCourseService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          // !!! observable sto service gia addMode otan patas add
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.activeCourseSubscription = this.activeCourseService.getActiveCourseByCourseId(this.id)
              .pipe(first())
              .subscribe((currentActiveCourseData: ActiveCourse) => {
                this.activeCourseForm.patchValue({
                  academicYear: currentActiveCourseData.academicYear,
                  maxTheoryLectures: currentActiveCourseData.maxTheoryLectures,
                  maxLabLectures: currentActiveCourseData.maxLabLectures,
                  teachingStuff: currentActiveCourseData.teachingStuff,
                  students: currentActiveCourseData.students,
                  status: currentActiveCourseData.status,
                  course: currentActiveCourseData.course.id,
                });
              });
          }
        }
      );
        console.log("BEFORE FORM INITIALIZATION: ");
      this.activeCourseForm = this.formBuilder.group({
        academicYear: ['', Validators.required],
        maxTheoryLectures: [0, Validators.required],
        maxLabLectures: [0, Validators.required],
        teachingStuff: [null, Validators.required],
        students: [null, Validators.required],
        status: [false, Validators.required],
        course: [null, Validators.required],
        hideRequired: this.hideRequiredControl,
        floatLabel: this.floatLabelControl
      });
  }

  get f() { return this.activeCourseForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.activeCourseForm.invalid) {
      return;
    }

    this.isLoading = true;
    const activeCourseData = {
      academicYear: this.activeCourseForm.value.academicYear,
      maxTheoryLectures: this.activeCourseForm.value.maxTheoryLectures,
      maxLabLectures: this.activeCourseForm.value.maxLabLectures,
      teachingStuff: this.activeCourseForm.value.teachingStuff,
      students: this.activeCourseForm.value.students,
      status: this.activeCourseForm.value.status,
      course: this.activeCourseForm.value.course
    };

    this.activeCourseForm.reset();

    if (this.isAddMode) {
      this.createCourse(activeCourseData);
    } else {
      this.updateCourse(activeCourseData);
    }
  }

  private createCourse(activeCourseData: ActiveCourseRequestData) {
    this.createActiveCourseSubscription = this.activeCourseService.createActiveCourse(activeCourseData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Active Course added');
        this.router.navigate(['../'], { relativeTo: this.route });
      })
      .add(() => { this.isLoading = false; });
  }

  private updateCourse(activeCourseData: ActiveCourseRequestData) {
    this.updateActiveCourseSubscription = this.activeCourseService.updateActiveCourse(this.id, activeCourseData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Active Course updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      })
      .add(() => this.isLoading = false);
  }

  onCancel() {
    this.router.navigate(['/active-courses'], { relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.activeCourseSubscription) {
      this.activeCourseSubscription.unsubscribe();
    }
    if (this.createActiveCourseSubscription) {
      this.createActiveCourseSubscription.unsubscribe();
    }
    if (this.updateActiveCourseSubscription) {
      this.updateActiveCourseSubscription.unsubscribe();
    }
  }

}