import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { PresenceResponseData } from '../common/payload/response/presenceResponseData.interface';
import { PresenceService } from '../presence.service';

@Component({
  selector: 'app-presence-detail',
  templateUrl: './presence-detail.component.html',
  styleUrls: ['./presence-detail.component.css']
})
export class PresenceDetailComponent implements OnInit, OnDestroy {
  id!: number;
  presence!: PresenceResponseData;
  ensureDialogStatus!: boolean;
  presenceTable: boolean = false;

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  private ensureDialogSubscription!: Subscription;
  presenceTableLoadedSubscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private presenceService: PresenceService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService) { }

  ngOnInit(): void {
    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.currentUserId = this.currentUser.id;
        this.showAdminFeatures = this.currentUser.roles.includes('ADMIN');
        this.showTeacherFeatures = this.currentUser.roles.includes('TEACHER');
        this.showStudentFeatures = this.currentUser.roles.includes('STUDENT');
      }
    });

    this.presenceTableLoadedSubscription = this.presenceService.presenceTableLoadedState
    .subscribe((tableStatus: boolean) => {
      if (tableStatus) {
        this.presenceTable = tableStatus;
      } else {
        this.router.navigate(['/presences'], { relativeTo: this.route});
      }
    });

    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.presenceService.getPresenceById(this.id, this.currentUserId)
          .pipe(first())
          .subscribe(
            (currentPresence: PresenceResponseData) => {
              this.presence = currentPresence;
              this.presenceService.presenceSubject.next(this.presence);
              console.log("Presence Details: "+JSON.stringify(this.presence));
          },
          (error: any) => {
            this.router.navigate(['/presences'], { relativeTo: this.route});
          });
      }
    );
  }

  editPresence() {
    this.router.navigate(['/presences/edit/', this.id], { relativeTo: this.route });
  }
  /*
  deletePresence(id: number) {

    if (!this.presence) return;
    this.ensureDialogService.openDialog('will be Deleted', 'Presence for student '+this.presence.student.username, 'delete');

    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            //this.presence.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.presenceService.deletePresenceById(id)
                .pipe(first())
                .subscribe(() => {
                  //this.presence.isDeleting = false;
                  this.snackbarService.success('Presence deleted');
                  this.router.navigate(['../../'], { relativeTo: this.route });
                });
          }
        }
      );
  } */

  onCancel() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    if(this.ensureDialogSubscription) {
      this.ensureDialogSubscription.unsubscribe();
    }
    if(this.presenceTableLoadedSubscription) {
      this.presenceTableLoadedSubscription.unsubscribe();
    }
  }
}