import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ClassGroup } from 'src/app/classes-groups/class-group.model';
import { ClassSession } from 'src/app/classes-sessions/class-session.model';
import { UserResponseData } from 'src/app/users/common/payload/response/userResponseData.interface';
import { StudentSelectDialogComponent } from '../dialogs/student-select-dialog/student-select-dialog.component';

@Injectable({ providedIn: 'root' })
export class StudentSelectDialogService {
    public studentSelectDialogSubject = new Subject<UserResponseData | null>();
    public studentSelectDialogState = this.studentSelectDialogSubject.asObservable();

    constructor(private studentSelectDialog: MatDialog) { }

    selectStudent(object: any): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {object: object};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.studentSelectDialog.open(StudentSelectDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result: UserResponseData) => {
            console.log(`Dialog result: ${result}`);
            this.studentSelectDialogSubject.next(result);
        });
    }

}