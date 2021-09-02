import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Course } from 'src/app/courses/course.model';
import { CourseSelectDialogComponent } from '../dialogs/course-select-dialog/course-select-dialog.component';

@Injectable({ providedIn: 'root' })
export class CourseSelectDialogService {
    public courseSelectDialogSubject = new Subject<Course | null>();
    public courseSelectDialogState = this.courseSelectDialogSubject.asObservable();

    constructor(private courseSelectDialog: MatDialog) { }

    selectCourse(course: Course): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {course};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.courseSelectDialog.open(CourseSelectDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result: Course) => {
            console.log(`Dialog result: ${result}`);
            this.courseSelectDialogSubject.next(result);
        });
    }

}