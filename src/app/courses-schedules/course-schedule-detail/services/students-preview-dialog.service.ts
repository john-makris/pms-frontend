import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { UserData } from 'src/app/users/common/payload/response/userData.interface';
import { StudentsPreviewDialogComponent } from '../dialogs/students-preview-dialog/students-preview-dialog.component';

@Injectable({ providedIn: 'root' })
export class StudentsPreviewDialogService {
    public studentsPreviewDialogSubject = new Subject<Array<UserData> | null>();
    public studentsPreviewDialogState = this.studentsPreviewDialogSubject.asObservable();

    constructor(private studentsPreviewDialog: MatDialog) { }

    showStudents(activeCourseId: number): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {activeCourseId};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.studentsPreviewDialog.open(StudentsPreviewDialogComponent, dialogConfig);
    }

}