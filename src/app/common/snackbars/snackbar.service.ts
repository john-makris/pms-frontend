import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { SnackbarData } from './snackbar-data.interface';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
    private snackbarSubject = new Subject<SnackbarData>();
    public snackbarState = this.snackbarSubject.asObservable();

    constructor(private snackbar: MatSnackBar) { }

    success(_message: string) {
        this.showSnackbar(_message, 'success', 3000);
    }

    error(_message: string) {
        this.showSnackbar(_message, 'danger', 15000);
    }

    info(_message: string) {
        this.showSnackbar(_message, 'info', 1000);
    }

    warn(_message: string) {
        this.showSnackbar(_message, 'warning', 1000);
    }

    showSnackbar(
        _message: string,
        _styleClass: string,
        _duration: number) {
            const message = _message;
            const action = 'Close';
            const duration = _duration;
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