import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { CourseSelectDialogComponent } from 'src/app/courses-schedules/course-schedule-edit/dialogs/course-select-dialog/course-select-dialog.component';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { Course } from 'src/app/courses/course.model';

@Injectable({ providedIn: 'root' })
export class CourseScheduleSelectDialogService {
    public courseScheduleSelectDialogSubject = new Subject<Course | null>();
    public courseScheduleSelectDialogState = this.courseScheduleSelectDialogSubject.asObservable();

    constructor(private courseScheduleSelectDialog: MatDialog) { }

    selectCourseSchedule(courseSchedule: CourseSchedule): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {course: courseSchedule};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.courseScheduleSelectDialog.open(CourseSelectDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result: Course) => {
            console.log(`Dialog result: ${result}`);
            this.courseScheduleSelectDialogSubject.next(result);
        });
    }

}