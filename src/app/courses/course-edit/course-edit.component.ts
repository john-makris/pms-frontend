import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Department } from 'src/app/departments/department.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { CourseRequestData } from '../common/payload/request/courseRequestData.interface';
import { CourseResponseData } from '../common/payload/response/courseResponseData.interface';
import { CourseService } from '../course.service';
import { Semester } from '../semesters/semester.model';
import { SemesterService } from '../semesters/semester.service';

@Component({
  selector: 'app-course-edit',
  templateUrl: './course-edit.component.html',
  styleUrls: ['./course-edit.component.css']
})
export class CourseEditComponent implements OnInit, OnDestroy{
  courseForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;
  departments: Department[] = [];
  semesters: Semester[] = [];
  selectedSemesterId: string = '';
  selectedDepartmentId: string = '';
  allDepartments: boolean = true;

  departmentIdSubscription!: Subscription;
  routeSubscription!: Subscription;
  courseSubscription!: Subscription;
  departmentsSubscription!: Subscription;
  semestersSubscription!: Subscription;
  createCourseSubscription!: Subscription;
  updateCourseSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private semesterService: SemesterService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.loadSemesters();

    this.departmentIdSubscription = this.departmentService.departmentIdState
      .subscribe((departmentId: number) => {
        console.log("EDIT COMPONENT: "+departmentId);
        if (departmentId == 0) {
          this.allDepartments = true;
        } else {
          this.allDepartments = false;
          this.selectedDepartmentId = departmentId.toString();
        }
    });

    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.courseSubscription = this.courseService.getCourseById(this.id)
              .pipe(first())
              .subscribe((currentCourseData: CourseResponseData) => {
                this.courseForm.patchValue({
                  name: currentCourseData.name,
                  semesterId: currentCourseData.semester.id,
                  departmentId: currentCourseData.department.id
                });
                this.selectedSemesterId = currentCourseData.semester.id.toString();
                this.selectedDepartmentId = currentCourseData.department.id.toString();
                console.log(currentCourseData.department.id);
              });
          } else {
            if (this.allDepartments) {
              this.loadDepartments();
            }
          }
        }
      );
        console.log("BEFORE FORM INITIALIZATION: "+this.selectedDepartmentId);
      this.courseForm = this.formBuilder.group({
        name: ['', Validators.required],
        semesterId: [this.selectedSemesterId, Validators.required],
        departmentId: [this.selectedDepartmentId, Validators.required]
      });
  }

  get f() { return this.courseForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.courseForm.invalid) {
      return;
    }

    this.isLoading = true;
    const courseData = {
      name: this.courseForm.value.name,
      semester: {
        id: +this.courseForm.value.semesterId
      },
      department: {
        id: +this.courseForm.value.departmentId
      }
    };

    //this.courseForm.reset();

    if (this.isAddMode) {
      this.createCourse(courseData);
    } else {
      this.updateCourse(courseData);
    }
  }

  private createCourse(courseData: CourseRequestData) {
    this.createCourseSubscription = this.courseService.createCourse(courseData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Course added');
        this.router.navigate(['../'], { relativeTo: this.route });
      })
      .add(() => { this.isLoading = false; });
  }

  private updateCourse(courseData: CourseRequestData) {
    this.updateCourseSubscription = this.courseService.updateCourse(this.id, courseData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Course updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      })
      .add(() => this.isLoading = false);
  }

  loadDepartments() {
    this.departmentsSubscription = this.departmentService.getAllDepartments()
    .pipe(first())
    .subscribe(departments => {
      this.departments = departments;
      console.log(this.departments);
    });
  }

  loadSemesters() {
    this.semestersSubscription = this.semesterService.getAllSemesters()
    .pipe(first())
    .subscribe(semesters => {
      this.semesters = semesters;
      console.log(this.semesters);
    });
  }

  onCancel() {
    this.router.navigate(['/courses'], { relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.departmentIdSubscription) {
      this.departmentIdSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.courseSubscription) {
      this.courseSubscription.unsubscribe();
    }
    if (this.createCourseSubscription) {
      this.createCourseSubscription.unsubscribe();
    }
    if (this.updateCourseSubscription) {
      this.updateCourseSubscription.unsubscribe();
    }
    if(this.departmentsSubscription) {
      this.departmentsSubscription.unsubscribe();
    }
  }

}