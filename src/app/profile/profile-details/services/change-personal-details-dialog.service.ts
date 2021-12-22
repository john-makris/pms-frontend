import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { AuthUser } from 'src/app/users/auth-user.model';
import { ChangePersonalDetailsComponent } from '../dialogs/change-personal-details-dialog/change-personal-details/change-personal-details.component';

@Injectable({ providedIn: 'root' })
export class ChangePersonalDetailsDialogService {
    public changePersonalDetailsDialogSubject = new Subject<CourseSchedule | null>();
    public changePersonalDetailsDialogState = this.changePersonalDetailsDialogSubject.asObservable();

    constructor(private changePersonalDetailsDialog: MatDialog) { }

    changePersonalDetails(authUser: AuthUser): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {authUser: authUser};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.changePersonalDetailsDialog.open(ChangePersonalDetailsComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result: CourseSchedule) => {
            console.log("Dialog result: "+JSON.stringify(result));
            this.changePersonalDetailsDialogSubject.next(result);
        });
    }

}