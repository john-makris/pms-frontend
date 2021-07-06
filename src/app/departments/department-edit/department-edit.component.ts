import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { School } from 'src/app/schools/school.model';
import { SchoolService } from 'src/app/schools/school.service';
import { Department } from '../department.model';
import { DepartmentService } from '../department.service';
import { SchoolsDepartment } from '../schools-department.model';
import { SchoolsDepartmentService } from '../schools-department.service';

export interface DepartmentData {
  name: string
}

export interface SchoolsDepartmentData {
  school: {
    id: number
  },
  department: {
    id: number
  }
}

@Component({
  selector: 'app-department-edit',
  templateUrl: './department-edit.component.html',
  styleUrls: ['./department-edit.component.css']
})
export class DepartmentEditComponent implements OnInit {
  departmentForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;
  schools: School[] = [];
  selectedSchoolId!: number;
  sdData!: SchoolsDepartmentData;
  schoolsDepartmentId!: number;

  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private schoolsDepartmentService: SchoolsDepartmentService,
    private schoolService: SchoolService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          this.schoolService.getAllSchools()
          .pipe(first())
          .subscribe(schools => {
            this.schools = schools;
            console.log(this.schools);
          });
          if(!this.isAddMode) {
            this.schoolsDepartmentService.getByDepartmentId(this.id)
              .pipe(first())
              .subscribe((x: SchoolsDepartment) => {
                if(x) {
                  this.schoolsDepartmentId = x.id;
                  this.departmentForm.patchValue({
                    name: x.department.name,
                    schoolId: x.school.id
                  });
                }
                this.selectedSchoolId = this.departmentForm.value.schoolId;
              });
          }
        }
      );

      this.departmentForm = this.formBuilder.group({
        name: ['', Validators.required],
        schoolId: [null, Validators.required],
        hideRequired: this.hideRequiredControl,
        floatLabel: this.floatLabelControl
      });
  }

  get f() { return this.departmentForm.controls ; }

  onSubmit() {
    this.submitted = true;

    if (this.departmentForm.invalid) {
      return;
    }
    console.log(this.departmentForm.value.schoolId);
    this.isLoading = true;
    const departmentData = {
      name: this.departmentForm.value.name
    };
    console.log("Department Data: "+ JSON.stringify(departmentData));
    if (this.isAddMode) {
      this.createDepartment(departmentData);
    } else {
      this.updateDepartment(departmentData);
    }
  }

  private createDepartment(departmentData: DepartmentData) {
    this.departmentService.createDepartment(departmentData)
      .pipe(first())
      .subscribe((createdDepartment: Department) => {
        if (createdDepartment) {
          this.sdData = {
            school: {
              id: this.departmentForm.value.schoolId
            },
            department: {
              id: createdDepartment.id
            }
          };
          console.log(this.sdData);
          this.schoolsDepartmentService.createSchoolsDepartment(this.sdData)
          .pipe(first())
          .subscribe(() => {
            this.snackbarService.success('Department added');
            this.router.navigate(['../'], { relativeTo: this.route });
          })
        }
      })
      .add(() => { this.isLoading = false; });
  }

  private updateDepartment(departmentData: DepartmentData) {
      this.departmentService.updateDepartment(this.id, departmentData)
      .pipe(first())
      .subscribe((updatedDepartment: Department) => {
        if (updatedDepartment) {
          this.sdData = {
            school: {
              id: this.departmentForm.value.schoolId
            },
            department: {
              id: updatedDepartment.id
            }
          };
          console.log(this.sdData);
          this.schoolsDepartmentService.updateSchoolsDepartment(this.schoolsDepartmentId, this.sdData)
          .pipe(first())
          .subscribe(() => {
            this.snackbarService.success('Department updated');
            this.router.navigate(['../../'], { relativeTo: this.route});
          })
        }
      })
      .add(() => { this.isLoading = false; });
  }

  onCancel() {
    this.router.navigate(['/departments'], { relativeTo: this.route});
  }


}
