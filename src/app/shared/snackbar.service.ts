import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

export interface SnackbarData {
    message: string, 
    action: string,
    duration: number,
    styleClass: string
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
    private snackbarSubject = new Subject<SnackbarData>();
    public snackbarState = this.snackbarSubject.asObservable();

    constructor(private snackbar: MatSnackBar) { }

    success(_message: string) {
        this.showSnackbar(_message, 'success');
    }

    error(_message: string) {
        this.showSnackbar(_message, 'danger');
    }

    info(_message: string) {
        this.showSnackbar(_message, 'info');
    }

    warn(_message: string) {
        this.showSnackbar(_message, 'warning');
    }

    showSnackbar(
        _message: string,
        _styleClass: string) {
            const message = _message;
            const action = 'Close';
            const duration = 3000;
            const styleClass = _styleClass;

        this.snackbarSubject.next({
            message, 
            action,
            duration,
            styleClass
        });

        let _snackbar = this.snackbar.open(
            message, 
            action, 
            {
                duration: duration,
                panelClass: [styleClass]
            }
        );
        _snackbar.onAction().subscribe(() => {
            _snackbar.dismiss();
        });
    }

}