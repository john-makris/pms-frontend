import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { ExcuseApplicationResponseData } from '../common/payload/response/excuseApplicationResponseData.interface';
import { ExcuseApplicationsResponseData } from '../common/payload/response/excuseApplicationsResponseData.interface';
import { ExcuseApplicationService } from '../excuse-application.service';

@Component({
  selector: 'app-excuse-application-detail',
  templateUrl: './excuse-application-detail.component.html',
  styleUrls: ['./excuse-application-detail.component.css']
})
export class ExcuseApplicationDetailComponent implements OnInit, OnDestroy {
  id!: number;
  excuseApplication!: ExcuseApplicationResponseData;
  ensureDialogStatus!: boolean;
  excuseApplicationTable: boolean = false;
  panelOpenState: boolean = false;

  private ensureDialogSubscription!: Subscription;
  excuseApplicationTableLoadedSubscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private excuseApplicationService: ExcuseApplicationService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService) { }

  ngOnInit(): void {
    this.excuseApplicationTableLoadedSubscription = this.excuseApplicationService.excuseApplicationTableLoadedState
    .subscribe((tableStatus: boolean) => {
      if (tableStatus) {
        this.excuseApplicationTable = tableStatus;
      } else {
        this.router.navigate(['/excuse-applications'], { relativeTo: this.route});
      }
    });

    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.excuseApplicationService.getExcuseApplicationById(this.id)
          .pipe(first())
          .subscribe((currentExcuseApplication: ExcuseApplicationResponseData) => {
            this.excuseApplication = currentExcuseApplication;
            this.excuseApplicationService.excuseApplicationSubject.next(this.excuseApplication);
            console.log("Excuse Application Details: "+JSON.stringify(this.excuseApplication));
          });
      }
    );
  }

  editExcuseApplication() {
    this.router.navigate(['/excuse-applications/edit/', this.id], { relativeTo: this.route });
  }
  
  deleteExcuseApplication(id: number) {

    if (!this.excuseApplication) return;
    this.ensureDialogService.openDialog('will be Deleted', 'Excuse Application', 'delete');

    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            //this.classGroup.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.excuseApplicationService.deleteExcuseApplicationById(id)
                .pipe(first())
                .subscribe(() => {
                  //this.classGroup.isDeleting = false;
                  this.snackbarService.success('Excuse Application deleted');
                  this.router.navigate(['../../'], { relativeTo: this.route });
                });
          }
        }
      );
  }

  onCancel() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    if(this.ensureDialogSubscription) {
      this.ensureDialogSubscription.unsubscribe();
    }
    if(this.excuseApplicationTableLoadedSubscription) {
      this.excuseApplicationTableLoadedSubscription.unsubscribe();
    }
  }
}