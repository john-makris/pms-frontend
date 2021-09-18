import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Course } from 'src/app/courses/course.model';
import { UserData } from 'src/app/users/common/payload/response/userData.interface';
import { ActiveCourse } from '../active-course.model';
import { ActiveCourseService } from '../active-course.service';
import { ActiveCourseRequestData } from '../common/payload/request/activeCourseRequestData.interface';
import { CourseSelectDialogService } from './services/course-select-dialog.service';
import { TeachersSelectDialogService } from './services/teachers-select-dialog.service';

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

  panelOpenState = false;
  currentTeachingStuff!: Array<UserData>;
  currentCourse!: Course;
  currentActiveCourse!: ActiveCourse;
  selectedAcademicYear: string = '';

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
    private courseSelectDialogService: CourseSelectDialogService,
    private teachersSelectDialogService: TeachersSelectDialogService,
    private activeCourseService: ActiveCourseService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.activeCourseSubscription = this.activeCourseService.getActiveCourseByCourseId(this.id)
              .pipe(first())
              .subscribe((currentActiveCourseData: ActiveCourse) => {
                this.currentActiveCourse = currentActiveCourseData;
                this.activeCourseForm.patchValue({
                  academicYear: currentActiveCourseData.academicYear,
                  maxTheoryLectures: currentActiveCourseData.maxTheoryLectures,
                  maxLabLectures: currentActiveCourseData.maxLabLectures,
                  teachingStuff: currentActiveCourseData.teachingStuff,
                  students: currentActiveCourseData.students,
                  status: currentActiveCourseData.status,
                  courseId: currentActiveCourseData.course.id
                });
                this.selectedAcademicYear = currentActiveCourseData.academicYear;
              });
          }
        }
      );
        console.log("BEFORE FORM INITIALIZATION: ");
        this.activeCourseForm = this.formBuilder.group({
          academicYear: [this.selectedAcademicYear, Validators.required],
          maxTheoryLectures: [null, [Validators.required, Validators.max(12), Validators.min(1)]],
          maxLabLectures: [null, [Validators.required, Validators.max(12), Validators.min(1)]],
          status: [false, Validators.required],
          teachingStuff: [null],
          students: [null, Validators.required],
          courseId: [0, Validators.required],
          hideRequired: this.hideRequiredControl,
          floatLabel: this.floatLabelControl
        });

        this.courseSelectDialogService.courseSelectDialogState
          .subscribe((_course: Course | null) => {
            if (_course !== null) {
              console.log("CATCH COURSE: "+_course.name);
              this.activeCourseForm.patchValue({courseId: _course.id});
              this.currentCourse = _course;
            } else {
              if (!this.currentCourse) {
                this.f.courseId.setErrors({
                  'required': true
                });
              }
            }
        });

        this.teachersSelectDialogService.teachersSelectDialogState
        .subscribe((_teachers: Array<UserData> | null) => {
          if (_teachers !== null) {
            console.log("CATCH TEACHERS: ");
            _teachers.forEach(teacher => {
              console.log(teacher.username);
            });
            this.activeCourseForm.patchValue({teachingStuff: _teachers});
            this.currentTeachingStuff = _teachers;
          } else {
            if (!this.currentTeachingStuff) {
              this.f.teachingStuff.setErrors({
                'required': true
              });
            }
          }
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
      course: {
        id: this.activeCourseForm.value.course.id
      }
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

  selectCourse() {
    this.courseSelectDialogService.selectCourse(this.activeCourseForm.value.courseId);
  }

  selectTeachers() {
    this.f.teachingStuff.markAsTouched;
    this.teachersSelectDialogService.selectTeachers(this.activeCourseForm.value.teachingStuff);
  }

  onFileSelected(event: any) {
    
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