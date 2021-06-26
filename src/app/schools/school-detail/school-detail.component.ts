import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { School } from '../school.model';
import { SchoolService } from '../school.service';

@Component({
  selector: 'app-school-detail',
  templateUrl: './school-detail.component.html',
  styleUrls: ['./school-detail.component.css']
})
export class SchoolDetailComponent implements OnInit, OnDestroy {
  id!: number;
  school!: School;
  private ensureDialogSubscription!: Subscription;
  ensureDialogStatus!: boolean;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private schoolService: SchoolService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService) { }

  ngOnInit(): void {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.schoolService.getSchoolById(this.id)
          .pipe(first())
          .subscribe((x) => {
            this.school = x;
          });
      }
    );
  }

  editSchool() {
    this.router.navigate(['/schools/edit/', this.id], { relativeTo: this.route });
  }

  deleteSchool(id: number) {
    if (!this.school) return;
    this.ensureDialogService.openDialog('will be Deleted', this.school.name);
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            this.school.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.schoolService.deleteSchoolById(id)
                .pipe(first())
                .subscribe(() => {
                  this.school.isDeleting = false;
                  this.snackbarService.success('School deleted');
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