import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { CourseScheduleSelectDialogComponent } from '../dialogs/course-schedule-select-dialog/course-schedule-select.component';

@Injectable({ providedIn: 'root' })
export class CourseScheduleSelectDialogService {
    public courseScheduleSelectDialogSubject = new Subject<CourseSchedule | null>();
    public courseScheduleSelectDialogState = this.courseScheduleSelectDialogSubject.asObservable();

    constructor(private courseScheduleSelectDialog: MatDialog) { }

    selectCourseSchedule(courseSchedule: CourseSchedule): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {courseSchedule: courseSchedule};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.courseScheduleSelectDialog.open(CourseScheduleSelectDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result: CourseSchedule) => {
            console.log(`Dialog result: ${result}`);
            this.courseScheduleSelectDialogSubject.next(result);
        });
    }

}