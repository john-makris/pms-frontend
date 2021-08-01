import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { School } from 'src/app/schools/school.model';
import { SchoolService } from 'src/app/schools/school.service';
import { DepartmentService } from '../department.service';

export interface DepartmentData {
  name: string,
  school: {
    id: number
  }
}

@Component({
  selector: 'app-department-edit',
  templateUrl: './department-edit.component.html',
  styleUrls: ['./department-edit.component.css']
})
export class DepartmentEditComponent implements OnInit {
  /*departmentForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;
  schools: School[] = [];
  selectedSchoolId!: number;

  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private schoolService: SchoolService,
    private snackbarService: SnackbarService
  ) { }*/

  ngOnInit(): void {
    /*this.id = this.route.snapshot.params['id'];
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.schoolService.getAllSchools()
            .pipe(first())
            .subscribe(schools => {
              this.schools = schools;
              console.log(this.schools);
            });
            this.departmentService.getDepartmentById(this.id)
              .pipe(first())
              .subscribe(x => {
                this.departmentForm.patchValue({
                  name: x.name,
                  schoolId: x.school.id
                });
                this.selectedSchoolId = x.school.id;
                console.log(x.school.id);
              });
          } else {
            this.schoolService.getAllSchools()
            .pipe(first())
            .subscribe(schools => {
              this.schools = schools;
              console.log(this.schools);
            });
          }
        }
      );

      this.departmentForm = this.formBuilder.group({
        name: ['', Validators.required],
        schoolId: ['', Validators.required],
        hideRequired: this.hideRequiredControl,
        floatLabel: this.floatLabelControl
      });*/
  }

  /*get f() { return this.departmentForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.departmentForm.invalid) {
      return;
    }

    this.isLoading = true;
    const departmentData = {
      name: this.departmentForm.value.name,
      school: {
        id: this.departmentForm.value.schoolId
      }
    };

    if (this.isAddMode) {
      this.createDepartment(departmentData);
    } else {
      this.updateDepartment(departmentData);
    }
  }

  private createDepartment(departmentData: DepartmentData) {
    this.departmentService.createDepartment(departmentData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Department added');
        this.router.navigate(['../'], { relativeTo: this.route });
      })
      .add(() => { this.isLoading = false; });
  }

  private updateDepartment(departmentData: DepartmentData) {
    this.departmentService.updateDepartment(this.id, departmentData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Department updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      })
      .add(() => this.isLoading = false);
  }

  onCancel() {
    this.router.navigate(['/departments'], { relativeTo: this.route});
  }

*/
}