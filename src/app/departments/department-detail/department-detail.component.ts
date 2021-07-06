import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Department } from '../department.model';
import { DepartmentService } from '../department.service';
import { SchoolsDepartment } from '../schools-department.model';
import { SchoolsDepartmentService } from '../schools-department.service';

@Component({
  selector: 'app-department-detail',
  templateUrl: './department-detail.component.html',
  styleUrls: ['./department-detail.component.css']
})
export class DepartmentDetailComponent implements OnInit, OnDestroy{
  id!: number;
  schoolsDepartment!: SchoolsDepartment;
  private ensureDialogSubscription!: Subscription;
  ensureDialogStatus!: boolean;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private schoolsDepartmentService: SchoolsDepartmentService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService) { }

  ngOnInit(): void {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.schoolsDepartmentService.getByDepartmentId(this.id)
          .pipe(first())
          .subscribe((x: SchoolsDepartment) => {
            this.schoolsDepartment = x;
          });
      }
    );
  }

  editDepartment() {
    this.router.navigate(['/departments/edit/', this.id], { relativeTo: this.route });
  }

  deleteDepartment(id: number) {
    if (!this.schoolsDepartment.department) return;
    this.ensureDialogService.openDialog('will be Deleted', this.schoolsDepartment.department.name);
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            this.schoolsDepartment.department.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.schoolsDepartmentService.deleteSchoolsDepartmentById(this.schoolsDepartment.id)
              .pipe(first())
              .subscribe(error => {
                if(!error) {
                  console.log("No error exists");
                  this.departmentService.deleteDepartmentById(id)
                  .pipe(first())
                  .subscribe(() => {
                    this.schoolsDepartment.department.isDeleting = false;
                    this.snackbarService.success('Department deleted');
                    this.router.navigate(['../../'], { relativeTo: this.route });
                  });
                }
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