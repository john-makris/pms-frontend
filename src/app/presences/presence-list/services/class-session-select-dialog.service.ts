import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ClassSessionResponseData } from 'src/app/classes-sessions/common/payload/response/classSessionResponseData.interface';
import { ClassSessionSelectDialogComponent } from '../dialogs/class-session-select-dialog/class-session-select-dialog.component';

@Injectable({ providedIn: 'root' })
export class ClassSessionSelectDialogService {
    public classSessionSelectDialogSubject = new Subject<ClassSessionResponseData | null>();
    public classSessionSelectDialogState = this.classSessionSelectDialogSubject.asObservable();

    constructor(private classSessionSelectDialog: MatDialog) { }

    selectClassSession(classSession: ClassSessionResponseData): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {classSession: classSession};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.classSessionSelectDialog.open(ClassSessionSelectDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result: ClassSessionResponseData) => {
            console.log(`Dialog result: ${result}`);
            this.classSessionSelectDialogSubject.next(result);
        });
    }

}