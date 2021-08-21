import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SnackbarService } from '../snackbars/snackbar.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private snackbarService: SnackbarService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err instanceof HttpErrorResponse && !request.url.includes('auth/signin') && err.status === 401) {
                console.log("Error Interceptor");
                return next.handle(request);
            } else {
                const error = err.error?.message || err.statusText;
                // best solution is to output error
                this.snackbarService.error(err.error.message);
                console.error(err);
                console.log("BGHKE APO TO IF");
                return throwError(error);
            }
        }));
    }
}