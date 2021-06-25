import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { EnsureDialogData } from './ensure-dialog-data.interface';
import { EnsureDialogComponent } from './ensure-dialog/ensure-dialog.component';

@Injectable({ providedIn: 'root' })
export class EnsureDialogService {
    public ensureDialogSubject = new Subject<boolean>();
    public ensureDialogState = this.ensureDialogSubject.asObservable();

    constructor(private dialog: MatDialog) { }

    openDialog(_title: string, _content: string): void {
        const dialogRef = this.dialog.open(EnsureDialogComponent, {
            width: 'calc(22em)',
            data: {title: _title, content: _content},
            panelClass: ['ensure-dialog']
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        })
    }

}