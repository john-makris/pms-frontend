import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { School } from 'src/app/schools/school.model';
import { SchoolService } from 'src/app/schools/school.service';
import { DepartmentRequestData } from '../common/payload/request/departmentRequestData.interface';
import { DepartmentService } from '../department.service';

@Component({
  selector: 'app-department-edit',
  templateUrl: './department-edit.component.html',
  styleUrls: ['./department-edit.component.css']
})
export class DepartmentEditComponent implements OnInit, OnDestroy {
  departmentForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;
  schools: School[] = [];
  selectedSchoolId: number = 0;
  allSchools: boolean = true;

  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  schoolIdSubscription!: Subscription;
  routeSubscription!: Subscription;
  departmentSubscription!: Subscription;
  schoolsSubscription!: Subscription;
  createDepartmentSubscription!: Subscription;
  updateDepartmentSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private schoolService: SchoolService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.schoolIdSubscription = this.schoolIdSubscription = this.schoolService.schoolIdState
      .subscribe((schoolId: number) => {
        console.log("EDIT COMPONENT: "+schoolId);
        if (schoolId == 0) {
          this.allSchools = true;
        } else {
          this.allSchools = false;
          this.selectedSchoolId = schoolId;
        }
    });

    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.departmentSubscription = this.departmentService.getDepartmentById(this.id)
              .pipe(first())
              .subscribe((currentDepartmentData: DepartmentRequestData) => {
                this.departmentForm.patchValue({
                  name: currentDepartmentData.name,
                  schoolId: currentDepartmentData.school.id
                });
                this.selectedSchoolId = currentDepartmentData.school.id;
                console.log(currentDepartmentData.school.id);
              });
          } else {
            if (this.allSchools) {
              this.loadSchools();
            }
          }
        }
      );
        console.log("BEFORE FORM INITIALIZATION: "+this.selectedSchoolId);
      this.departmentForm = this.formBuilder.group({
        name: ['', Validators.required],
        schoolId: [this.selectedSchoolId, Validators.required],
        hideRequired: this.hideRequiredControl,
        floatLabel: this.floatLabelControl
      });
  }

  get f() { return this.departmentForm.controls; }

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

    this.departmentForm.reset();

    if (this.isAddMode) {
      this.createDepartment(departmentData);
    } else {
      this.updateDepartment(departmentData);
    }
  }

  private createDepartment(departmentData: DepartmentRequestData) {
    this.createDepartmentSubscription = this.departmentService.createDepartment(departmentData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Department added');
        this.router.navigate(['../'], { relativeTo: this.route });
      })
      .add(() => { this.isLoading = false; });
  }

  private updateDepartment(departmentData: DepartmentRequestData) {
    this.updateDepartmentSubscription = this.departmentService.updateDepartment(this.id, departmentData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Department updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      })
      .add(() => this.isLoading = false);
  }

  loadSchools() {
    this.schoolsSubscription = this.schoolService.getAllSchools()
    .pipe(first())
    .subscribe(schools => {
      this.schools = schools;
      console.log(this.schools);
    });
  }

  onCancel() {
    this.router.navigate(['/departments'], { relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.schoolIdSubscription) {
      this.schoolIdSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.departmentSubscription) {
      this.departmentSubscription.unsubscribe();
    }
    if (this.createDepartmentSubscription) {
      this.createDepartmentSubscription.unsubscribe();
    }
    if (this.updateDepartmentSubscription) {
      this.updateDepartmentSubscription.unsubscribe();
    }
    if(this.schoolsSubscription) {
      this.schoolsSubscription.unsubscribe();
    }
  }

}