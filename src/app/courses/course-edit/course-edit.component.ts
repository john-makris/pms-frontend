import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Department } from 'src/app/departments/department.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { CourseService } from '../course.service';

export interface CourseData {
  name: string,
  semester: string,
  department: {
    id: number
  }
}

@Component({
  selector: 'app-course-edit',
  templateUrl: './course-edit.component.html',
  styleUrls: ['./course-edit.component.css']
})
export class CourseEditComponent implements OnInit {
  courseForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;
  departments: Department[] = [];
  selectedDepartmentId!: number;

  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.departmentService.getAllDepartments()
            .pipe(first())
            .subscribe(departments => {
              this.departments = departments;
              console.log(this.departments);
            });
            this.courseService.getCourseById(this.id)
              .pipe(first())
              .subscribe(x => {
                this.courseForm.patchValue({
                  name: x.name,
                  semester: x.semester,
                  departmentId: x.department.id
                });
                this.selectedDepartmentId = x.department.id;
                console.log(x.department.id);
              });
          } else {
            this.departmentService.getAllDepartments()
            .pipe(first())
            .subscribe(departments => {
              this.departments = departments;
              console.log(this.departments);
            });
          }
        }
      );

      this.courseForm = this.formBuilder.group({
        name: ['', Validators.required],
        semester: ['', Validators.required],
        departmentId: ['', Validators.required],
        hideRequired: this.hideRequiredControl,
        floatLabel: this.floatLabelControl
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
      semester: this.courseForm.value.semester,
      department: {
        id: this.courseForm.value.departmentId
      }
    };

    if (this.isAddMode) {
      this.createCourse(courseData);
    } else {
      this.updateCourse(courseData);
    }
  }

  private createCourse(courseData: CourseData) {
    this.courseService.createCourse(courseData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Course added');
        this.router.navigate(['../'], { relativeTo: this.route });
      })
      .add(() => { this.isLoading = false; });
  }

  private updateCourse(courseData: CourseData) {
    this.courseService.updateCourse(this.id, courseData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Course updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      })
      .add(() => this.isLoading = false);
  }

  onCancel() {
    this.router.navigate(['/courses'], { relativeTo: this.route});
  }

}
