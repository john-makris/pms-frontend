import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SnackbarService } from '../snackbars/snackbar.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private snackbarService: SnackbarService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            const error = err.error?.message || err.statusText;
            // best solution is to output error
            this.snackbarService.error(err.error.message);
            console.error(err);
            return throwError(error);
        }))
    }
}