import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { CourseSelectDialogComponent } from '../dialogs/course-select-dialog/course-select-dialog.component';
import { selectCourseDialogData } from '../interfaces/selectCourseDialogData.interface';

@Injectable({ providedIn: 'root' })
export class CourseSelectDialogService {
    public courseSelectDialogSubject = new Subject<number>();
    public courseSelectDialogState = this.courseSelectDialogSubject.asObservable();

    constructor(private courseSelectDialog: MatDialog) { }

    selectCourse(id: number): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {id};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.courseSelectDialog.open(CourseSelectDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result: number) => {
            console.log(`Dialog result: ${result}`);
            this.courseSelectDialogSubject.next(result);
        });
    }

}