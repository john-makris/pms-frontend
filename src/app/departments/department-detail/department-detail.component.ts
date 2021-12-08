import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Department } from '../department.model';
import { DepartmentService } from '../department.service';

@Component({
  selector: 'app-department-detail',
  templateUrl: './department-detail.component.html',
  styleUrls: ['./department-detail.component.css']
})
export class DepartmentDetailComponent implements OnInit, OnDestroy{
  id!: number;
  department!: Department;
  private ensureDialogSubscription!: Subscription;
  ensureDialogStatus!: boolean;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService) { }

  ngOnInit(): void {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.departmentService.getDepartmentById(this.id)
          .pipe(first())
          .subscribe((x) => {
            this.department = x;
          });
      }
    );
  }

  editDepartment() {
    this.router.navigate(['/departments/edit/', this.id], { relativeTo: this.route });
  }

  deleteDepartment(id: number) {
    if (!this.department) return;
    this.ensureDialogService.openDialog('will be Deleted', this.department.name, 'delete');
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            this.department.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.departmentService.deleteDepartmentById(id)
                .pipe(first())
                .subscribe(() => {
                  this.department.isDeleting = false;
                  this.snackbarService.success('Department deleted');
                  this.router.navigate(['../../'], { relativeTo: this.route });
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