import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first, last } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Course } from 'src/app/courses/course.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { UserData } from 'src/app/users/common/payload/response/userData.interface';
import { requiredFileTypes } from '../common/helpers/fileValidationHelper';
import { CourseScheduleRequestData } from '../common/payload/request/courseScheduleRequestData.interface';
import { CourseScheduleResponseData } from '../common/payload/response/courseScheduleResponseData.interface';
import { CourseScheduleService } from '../course-schedule.service';
import { CourseSelectDialogService } from './services/course-select-dialog.service';
import { TeachersSelectDialogService } from './services/teachers-select-dialog.service';

@Component({
  selector: 'app-course-schedule-edit',
  templateUrl: './course-schedule-edit.component.html',
  styleUrls: ['./course-schedule-edit.component.css']
})
export class CourseScheduleEditComponent implements OnInit, OnDestroy {
  courseScheduleForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;

  delimeter: string = ',' + '\xa0';
  panelOpenState = false;

  selectedFiles!: FileList | undefined;
  currentFile!: File | undefined;

  tableLoaded: boolean = false;
  state: boolean = false;
  currentTeachingStuff!: Array<UserData>;
  currentCourse!: Course;
  currentCourseSchedule!: CourseScheduleResponseData;
  selectedAcademicYear: string = '';

  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  @ViewChild('fileInput') input!: ElementRef;

  tableLoadedStateSubscription!: Subscription;
  teachersSelectDialogSubscription!: Subscription;
  courseSelectDialogSubscription!: Subscription;
  routeSubscription!: Subscription;
  departmentIdSubscription!: Subscription;
  courseScheduleSubscription!: Subscription;
  createCourseScheduleSubscription!: Subscription;
  updateCourseScheduleSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private courseSelectDialogService: CourseSelectDialogService,
    private teachersSelectDialogService: TeachersSelectDialogService,
    private courseScheduleService: CourseScheduleService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {

    this.tableLoadedStateSubscription = this.courseScheduleService.courseScheduleTableLoadedState
    .subscribe((loaded: boolean) => {
      if (loaded) {
        this.tableLoaded = loaded;
      } else {
        this.tableLoaded = false;
        this.onCancel();
      }
    });

    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.courseScheduleSubscription = this.courseScheduleService.getCourseScheduleById(this.id)
              .pipe(first())
              .subscribe((currentCourseScheduleData: CourseScheduleResponseData) => {
                this.currentCourseSchedule = currentCourseScheduleData;
                this.departmentService.departmentIdSubject.next(this.currentCourseSchedule.course.department.id);
                this.courseScheduleForm.patchValue({
                  academicYear: currentCourseScheduleData.academicYear,
                  maxTheoryLectures: currentCourseScheduleData.maxTheoryLectures,
                  maxLabLectures: currentCourseScheduleData.maxLabLectures,
                  teachingStuff: currentCourseScheduleData.teachingStuff,
                  status: currentCourseScheduleData.status,
                  course: currentCourseScheduleData.course,
                  theoryHours: this.hoursCalculator(currentCourseScheduleData.theoryLectureDuration),
                  theoryMinutes: this.minutesCalculator(currentCourseScheduleData.theoryLectureDuration),
                  labHours: this.hoursCalculator(currentCourseScheduleData.labLectureDuration),
                  labMinutes: this.minutesCalculator(currentCourseScheduleData.labLectureDuration)
                });
                this.currentCourse = currentCourseScheduleData.course;
                this.currentTeachingStuff = currentCourseScheduleData.teachingStuff;
                this.selectedAcademicYear = currentCourseScheduleData.academicYear;
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
    this.courseScheduleForm = this.formBuilder.group({
      maxTheoryLectures: [null, [Validators.required, Validators.max(12), Validators.min(1)]],
      maxLabLectures: [null, [Validators.required, Validators.max(12), Validators.min(1)]],
      theoryHours: [null, this.isAddMode ? [Validators.required, Validators.max(3), Validators.min(1)] : null],
      theoryMinutes: [null, this.isAddMode ? [Validators.required, Validators.max(59), Validators.min(0)] : null],
      labHours: [null, this.isAddMode ? [Validators.required, Validators.max(3), Validators.min(1)] : null],
      labMinutes: [null, this.isAddMode ? [Validators.required, Validators.max(59), Validators.min(0)] : null],
      teachingStuff: [null, Validators.required],
      students: [null, this.isAddMode ? Validators.required : null],
      course: [null, Validators.required],
      hideRequired: this.hideRequiredControl,
      floatLabel: this.floatLabelControl
    });

    this.courseSelectDialogSubscription = this.courseSelectDialogService.courseSelectDialogState
      .subscribe((_course: Course | null) => {
        this.courseScheduleForm.controls.course.markAsTouched();
        console.log("Course Data: "+JSON.stringify(_course));
        if (_course !== null) {
          console.log("CATCH COURSE: "+_course.name);
          this.courseScheduleForm.patchValue({course: _course});
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
        this.courseScheduleForm.controls.teachingStuff.markAsTouched();
        if (_teachers !== null) {
          console.log("CATCH TEACHERS: ");
          _teachers.forEach(teacher => {
            console.log(teacher.username);
          });
          this.courseScheduleForm.patchValue({teachingStuff: _teachers});
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

  get f() { return this.courseScheduleForm.controls; }

  selectCourse() {
    this.courseSelectDialogService.selectCourse(this.courseScheduleForm.value.course);
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
        this.courseScheduleForm.patchValue({students: this.currentFile});

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
      this.courseScheduleForm.controls.students.markAsTouched();
    }
  }

  selectTeachers() {
    this.teachersSelectDialogService.selectTeachers(this.courseScheduleForm.value.teachingStuff);
  }

  onSubmit() {
    this.submitted = true;

    if (this.courseScheduleForm.invalid) {
      return;
    }

    this.isLoading = true;

    let studentsFileData: File | null = null;

    if (this.courseScheduleForm.value.students) {
      studentsFileData = this.courseScheduleForm.value.students;
    }

    const courseScheduleData: CourseScheduleRequestData = {
      maxTheoryLectures: this.courseScheduleForm.value.maxTheoryLectures,
      maxLabLectures: this.courseScheduleForm.value.maxLabLectures,
      theoryLectureDuration: this.durationCalculatorInSeconds(
        this.courseScheduleForm.value.theoryHours,
        this.courseScheduleForm.value.theoryMinutes
      ),
      labLectureDuration: this.durationCalculatorInSeconds(
        this.courseScheduleForm.value.labHours,
        this.courseScheduleForm.value.labMinutes
      ),
      course: this.courseScheduleForm.value.course,
      teachingStuff: this.courseScheduleForm.value.teachingStuff
    };

    //this.courseScheduleForm.reset();

    if (this.isAddMode) {
      if (studentsFileData) {
        this.createCourseSchedule(courseScheduleData, studentsFileData);
      } else {
        this.snackbarService.error("File data field is required");
      }
    } else {
      this.updateCourseSchedule(courseScheduleData, studentsFileData);
    }
  }

  private createCourseSchedule(courseScheduleData: CourseScheduleRequestData, fileData: File) {
    this.createCourseScheduleSubscription = this.courseScheduleService.createCourseSchedule(courseScheduleData, fileData)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success('Course Schedule added');
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

  private updateCourseSchedule(courseScheduleData: CourseScheduleRequestData, fileData: File | null) {
    this.updateCourseScheduleSubscription = this.courseScheduleService.updateCourseSchedule(this.id, courseScheduleData, fileData)
      .pipe(last())
      .subscribe(() => {
        this.snackbarService.success('Course Schedule updated');
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

  durationCalculatorInSeconds(hours: number, minutes: number): number {
    return ((hours * 3600) + (minutes * 60));
  }

  hoursCalculator(duration: number): number {
    return (duration/3600);
  }

  minutesCalculator(duration: number): number {
    return (duration%3600);
  }

  onCancel() {
    this.router.navigate(['/courses-schedules'], { relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.departmentIdSubscription) {
      this.departmentIdSubscription.unsubscribe();
    }
    if (this.courseScheduleSubscription) {
      this.courseScheduleSubscription.unsubscribe();
    }
    if (this.courseSelectDialogSubscription) {
      this.courseSelectDialogSubscription.unsubscribe();
    }
    if (this.teachersSelectDialogSubscription) {
      this.teachersSelectDialogSubscription.unsubscribe();
    }
    if (this.createCourseScheduleSubscription) {
      this.createCourseScheduleSubscription.unsubscribe();
    }
    if (this.updateCourseScheduleSubscription) {
      this.updateCourseScheduleSubscription.unsubscribe();
    }
  }

}