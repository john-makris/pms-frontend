import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { UserData } from 'src/app/users/common/payload/response/userData.interface';
import { TeachersSelectDialogComponent } from '../dialogs/teachers-select-dialog/teachers-select-dialog.component';

@Injectable({ providedIn: 'root' })
export class TeachersSelectDialogService {
    public teachersSelectDialogSubject = new Subject<Array<UserData> | null>();
    public teachersSelectDialogState = this.teachersSelectDialogSubject.asObservable();

    constructor(private teachersSelectDialog: MatDialog) { }

    selectTeachers(teachers: Array<UserData>): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {teachers};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.teachersSelectDialog.open(TeachersSelectDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result: Array<UserData>) => {
            console.log(`Dialog result: ${result}`);
            this.teachersSelectDialogSubject.next(result);
        });
    }

}