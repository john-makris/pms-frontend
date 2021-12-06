import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { PresenceResponseData } from 'src/app/presences/common/payload/response/presenceResponseData.interface';
import { PresenceSelectDialogData } from '../data/presenceSelectDialogData.interface';
import { PresenceSelectDialogComponent } from '../dialogs/presence-select-dialog/presence-select-dialog.component';

@Injectable({ providedIn: 'root' })
export class PresenceSelectDialogService {
    public presenceSelectDialogSubject = new Subject<PresenceResponseData | null>();
    public presenceSelectDialogState = this.presenceSelectDialogSubject.asObservable();

    constructor(private presenceSelectDialog: MatDialog) { }

    selectPresence(object: PresenceSelectDialogData): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {object: object};
        dialogConfig.maxWidth = '30em';
        dialogConfig.minWidth = 'min-content';
    
        const dialogRef = this.presenceSelectDialog.open(PresenceSelectDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result: PresenceResponseData) => {
            console.log(`Dialog result: ${result}`);
            this.presenceSelectDialogSubject.next(result);
        });
    }

}