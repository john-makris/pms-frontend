import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first, last } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Course } from 'src/app/courses/course.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { UserData } from 'src/app/users/common/payload/response/userData.interface';
import { ActiveCourse } from '../active-course.model';
import { ActiveCourseService } from '../active-course.service';
import { requiredFileTypes } from '../common/helpers/fileValidationHelper';
import { ActiveCourseResponseData } from '../common/payload/data/activeCourseData.interface';
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

  delimeter: string = ',' + '\xa0';
  panelOpenState = false;

  selectedFiles!: FileList | undefined;
  currentFile!: File | undefined;

  state: boolean = false;
  currentTeachingStuff!: Array<UserData>;
  currentCourse!: Course;
  currentActiveCourse!: ActiveCourseResponseData;
  selectedAcademicYear: string = '';

  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  @ViewChild('fileInput') input!: ElementRef;

  teachersSelectDialogSubscription!: Subscription;
  courseSelectDialogSubscription!: Subscription;
  routeSubscription!: Subscription;
  departmentIdSubscription!: Subscription;
  activeCourseSubscription!: Subscription;
  createActiveCourseSubscription!: Subscription;
  updateActiveCourseSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
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
            this.activeCourseSubscription = this.activeCourseService.getActiveCourseById(this.id)
              .pipe(first())
              .subscribe((currentActiveCourseData: ActiveCourseResponseData) => {
                this.currentActiveCourse = currentActiveCourseData;
                this.departmentService.departmentIdSubject.next(this.currentActiveCourse.course.department.id);
                this.activeCourseForm.patchValue({
                  academicYear: currentActiveCourseData.academicYear,
                  maxTheoryLectures: currentActiveCourseData.maxTheoryLectures,
                  maxLabLectures: currentActiveCourseData.maxLabLectures,
                  teachingStuff: currentActiveCourseData.teachingStuff,
                  status: currentActiveCourseData.status,
                  course: currentActiveCourseData.course
                });
                this.currentCourse = currentActiveCourseData.course;
                this.currentTeachingStuff = currentActiveCourseData.teachingStuff;
                this.selectedAcademicYear = currentActiveCourseData.academicYear;
              });
          }
        }
      );

      this.departmentIdSubscription = this.departmentService.departmentIdState
        .subscribe((departmentId: number) => {
          if (departmentId === 0 && this.isAddMode) {
            this.onCancel();
          }
        });

        console.log("BEFORE FORM INITIALIZATION: ");
        this.activeCourseForm = this.formBuilder.group({
          academicYear: [this.selectedAcademicYear, Validators.required],
          maxTheoryLectures: [null, [Validators.required, Validators.max(12), Validators.min(1)]],
          maxLabLectures: [null, [Validators.required, Validators.max(12), Validators.min(1)]],
          status: [false, Validators.required],
          teachingStuff: [null, Validators.required],
          students: [null, this.isAddMode ? Validators.required : null],
          course: [null, Validators.required],
          hideRequired: this.hideRequiredControl,
          floatLabel: this.floatLabelControl
        });

        this.courseSelectDialogSubscription = this.courseSelectDialogService.courseSelectDialogState
          .subscribe((_course: Course | null) => {
            this.activeCourseForm.controls.course.markAsTouched();
            console.log("Course Data: "+JSON.stringify(_course));
            if (_course !== null) {
              console.log("CATCH COURSE: "+_course.name);
              this.activeCourseForm.patchValue({course: _course});
              this.currentCourse = _course;
              console.log("Is course valid ? "+this.f.course.valid);
            } else {
              if (!this.currentCourse) {
                this.f.course.setErrors({
                  'required': true
                });
              } else {
                console.log("Is course valid ? "+this.f.course.valid);
              }
            }
        });

        this.teachersSelectDialogSubscription = this.teachersSelectDialogService.teachersSelectDialogState
        .subscribe((_teachers: Array<UserData> | null) => {
          this.activeCourseForm.controls.teachingStuff.markAsTouched();
          if (_teachers !== null) {
            console.log("CATCH TEACHERS: ");
            _teachers.forEach(teacher => {
              console.log(teacher.username);
            });
            this.activeCourseForm.patchValue({teachingStuff: _teachers});
            this.currentTeachingStuff = _teachers;
            console.log("Teachers"+this.f.teachingStuff.valid);
          } else {
            if (!this.currentTeachingStuff) {
              this.f.teachingStuff.setErrors({
                'required': true
              });
            } else {
              console.log("Teachers"+this.f.teachingStuff.valid);
            }
          }
      });
  }

  get f() { return this.activeCourseForm.controls; }

  selectCourse() {
    this.courseSelectDialogService.selectCourse(this.activeCourseForm.value.course);
  }

  selectStudentsFile(event: any) {
    this.selectedFiles = event.target.files;
    console.log("Selected files: "+JSON.stringify(this.selectedFiles));
    if (this.selectedFiles) {
      const studentsFile: File | null = this.selectedFiles.item(0);

      if (studentsFile) {
        console.log("file type: "+studentsFile.type);
        this.currentFile = studentsFile;
        console.log("Current file: "+this.currentFile);
        this.activeCourseForm.patchValue({students: this.currentFile});

        console.log("Students"+this.f.students.valid);

        if (!requiredFileTypes(studentsFile)) {
          this.f.students.setErrors({
            'requiredFileTypes': true
          });
        }
      } else {
        if (this.isAddMode) {
          this.f.students.setErrors({
            'required': true
          });
        } else {
          this.f.students.updateValueAndValidity();
        }
      }
    }
  }

  onTouched() {
    console.log("FOCUS");
    if (this.state) {
      this.activeCourseForm.controls.students.markAsTouched();
    }
  }

  selectTeachers() {
    this.teachersSelectDialogService.selectTeachers(this.activeCourseForm.value.teachingStuff);
  }

  onSubmit() {
    this.submitted = true;

    if (this.activeCourseForm.invalid) {
      return;
    }

    this.isLoading = true;

    let studentsFileData: File | null = null;

    if (this.activeCourseForm.value.students) {
      studentsFileData = this.activeCourseForm.value.students;
    }

    const activeCourseData: ActiveCourseRequestData = {
      maxTheoryLectures: this.activeCourseForm.value.maxTheoryLectures,
      maxLabLectures: this.activeCourseForm.value.maxLabLectures,
      academicYear: this.activeCourseForm.value.academicYear,
      course: this.activeCourseForm.value.course,
      teachingStuff: this.activeCourseForm.value.teachingStuff,
      status: this.activeCourseForm.value.status
    };

    //this.activeCourseForm.reset();

    if (this.isAddMode) {
      if (studentsFileData) {
        this.createActiveCourse(activeCourseData, studentsFileData);
      } else {
        this.snackbarService.error("File data field is required");
      }
    } else {
      this.updateActiveCourse(activeCourseData, studentsFileData);
    }
  }

  private createActiveCourse(activeCourseData: ActiveCourseRequestData, fileData: File) {
    this.createActiveCourseSubscription = this.activeCourseService.createActiveCourse(activeCourseData, fileData)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success('Active Course added');
          this.router.navigate(['../'], { relativeTo: this.route });
      },
      (err: any) => {
        console.log("ERROR: "+err);
        if (err.includes('Excel') || err.includes('Csv')) {
          console.log("ERROR: "+err);
          this.f.students.setErrors({
            'inappropriate': true
          });
        }
      }).add(() => { this.isLoading = false; });
  }

  private updateActiveCourse(activeCourseData: ActiveCourseRequestData, fileData: File | null) {
    this.updateActiveCourseSubscription = this.activeCourseService.updateActiveCourse(this.id, activeCourseData, fileData)
      .pipe(last())
      .subscribe(() => {
        this.snackbarService.success('Active Course updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      },
      (err: any) => {
        console.log("ERROR: "+err.error?.message);
        if (err.includes('Excel') || err.includes('Csv')) {
          console.log("ERROR: "+err);
          this.f.students.setErrors({
            'inappropriate': true
          });
        }
      }).add(() => this.isLoading = false);
  }

  onCancel() {
    this.router.navigate(['/active-courses'], { relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.departmentIdSubscription) {
      this.departmentIdSubscription.unsubscribe();
    }
    if (this.activeCourseSubscription) {
      this.activeCourseSubscription.unsubscribe();
    }
    if (this.courseSelectDialogSubscription) {
      this.courseSelectDialogSubscription.unsubscribe();
    }
    if (this.teachersSelectDialogSubscription) {
      this.teachersSelectDialogSubscription.unsubscribe();
    }
    if (this.createActiveCourseSubscription) {
      this.createActiveCourseSubscription.unsubscribe();
    }
    if (this.updateActiveCourseSubscription) {
      this.updateActiveCourseSubscription.unsubscribe();
    }
  }

}