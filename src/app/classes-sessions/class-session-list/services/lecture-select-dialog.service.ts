import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { LectureResponseData } from 'src/app/lectures/common/payload/response/lectureResponseData.interface';
import { LectureSelectDialogComponent } from '../dialogs/lecture-select-dialog/lecture-select-dialog.component';

@Injectable({ providedIn: 'root' })
export class LectureSelectDialogService {
    public lectureSelectDialogSubject = new Subject<LectureResponseData | null>();
    public lectureSelectDialogState = this.lectureSelectDialogSubject.asObservable();

    constructor(private lectureSelectDialog: MatDialog) { }

    selectLecture(lecture: LectureResponseData): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {lecture: lecture};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.lectureSelectDialog.open(LectureSelectDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result: LectureResponseData) => {
            console.log("Dialog result: "+JSON.stringify(result));
            this.lectureSelectDialogSubject.next(result);
        });
    }

}