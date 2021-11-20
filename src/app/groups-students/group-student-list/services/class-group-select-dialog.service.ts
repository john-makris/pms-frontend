import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ClassGroupResponseData } from 'src/app/classes-groups/common/payload/response/classGroupResponseData.interface';
import { ClassGroupSelectDialogComponent } from '../dialogs/class-group-select-dialog/class-group-select-dialog.component';

@Injectable({ providedIn: 'root' })
export class ClassGroupSelectDialogService {
    public classGroupSelectDialogSubject = new Subject<ClassGroupResponseData | null>();
    public classGroupSelectDialogState = this.classGroupSelectDialogSubject.asObservable();

    constructor(private classGroupSelectDialog: MatDialog) { }

    selectClassGroup(classGroup: ClassGroupResponseData): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {classGroup: classGroup};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.classGroupSelectDialog.open(ClassGroupSelectDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result: ClassGroupResponseData) => {
            console.log(`Dialog result: ${result}`);
            this.classGroupSelectDialogSubject.next(result);
        });
    }

}