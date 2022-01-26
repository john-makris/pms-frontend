import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { ExcuseApplicationResponseData } from '../common/payload/response/excuseApplicationResponseData.interface';
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

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showSecretaryFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  private ensureDialogSubscription!: Subscription;
  excuseApplicationTableLoadedSubscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private excuseApplicationService: ExcuseApplicationService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.currentUserId = this.currentUser.id;
        this.showAdminFeatures = this.currentUser.roles.includes('ROLE_ADMIN');
        this.showStudentFeatures = this.currentUser.roles.includes('ROLE_STUDENT');
        this.showSecretaryFeatures = this.currentUser.roles.includes('ROLE_SECRETARY');
      }
    });

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
          this.excuseApplicationService.getExcuseApplicationById(this.id, this.currentUserId)
          .pipe(first())
          .subscribe(
            (currentExcuseApplication: ExcuseApplicationResponseData) => {
            this.excuseApplication = currentExcuseApplication;
            this.excuseApplicationService.excuseApplicationSubject.next(this.excuseApplication);
            console.log("Excuse Application Details: "+JSON.stringify(this.excuseApplication));
          },
          (error: any) => {
            this.router.navigate(['/excuse-applications'], { relativeTo: this.route});
          });
      }
    );
  }

  editExcuseApplication() {
    this.router.navigate(['/excuse-applications/edit/', this.id], { relativeTo: this.route });
  }
  
  /*
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
  } */

  onCancel() {
    if (this.showSecretaryFeatures) {
      this.excuseApplicationService.styleIndexSubject.next(-1);
    }
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