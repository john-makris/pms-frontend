import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { ClassSessionService } from '../class-session.service';
import { ClassSessionResponseData } from '../common/payload/response/classSessionResponseData.interface';

@Component({
  selector: 'app-class-session-detail',
  templateUrl: './class-session-detail.component.html',
  styleUrls: ['./class-session-detail.component.css']
})
export class ClassSessionDetailComponent implements OnInit {
  id!: number;
  classSession!: ClassSessionResponseData;
  private ensureDialogSubscription!: Subscription;
  ensureDialogStatus!: boolean;
  classSessionTable: boolean = false;

  classGroupTableLoadedSubscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private classSessionService: ClassSessionService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService) { }

  ngOnInit(): void {
    this.classGroupTableLoadedSubscription = this.classSessionService.classSessionTableLoadedState
    .subscribe((tableStatus: boolean) => {
      if (tableStatus) {
        this.classSessionTable = tableStatus;
      } else {
        this.router.navigate(['/classes-sessions'], { relativeTo: this.route});
      }
    });

    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.classSessionService.getClassSessionById(this.id)
          .pipe(first())
          .subscribe((currentClassSession: ClassSessionResponseData) => {
            this.classSession = currentClassSession;
            console.log("Class Session Details: "+JSON.stringify(this.classSession));
          });
      }
    );
  }

  editClassSession() {
    this.router.navigate(['/classes-sessions/edit/', this.id], { relativeTo: this.route });
  }
  
  deleteClassSession(id: number) {
/*    let groupType: string = '';
    if (this.classSession.groupType.name === 'Theory') {
      groupType = 'theories';
    } else {
      groupType = 'tabs';
    } */

    if (!this.classSession) return;
    this.ensureDialogService.openDialog('will be Deleted', this.classSession.nameIdentifier+' for '+this.classSession.classGroup.courseSchedule.course.name+' ');

    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            //this.classGroup.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.classSessionService.deleteClassSessionById(id)
                .pipe(first())
                .subscribe(() => {
                  //this.classGroup.isDeleting = false;
                  this.snackbarService.success('Class Session deleted');
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
    if(this.classGroupTableLoadedSubscription) {
      this.classGroupTableLoadedSubscription.unsubscribe();
    }
  }
}
