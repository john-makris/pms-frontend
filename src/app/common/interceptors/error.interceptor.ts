import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SnackbarService } from '../snackbars/snackbar.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private snackbarService: SnackbarService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log("Eimai mesa ston interceptor");
        return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {
            console.log("Eimai mesa sto return tou interceptor");
            if (err instanceof HttpErrorResponse && !request.url.includes('auth/signin') && err.status === 401) {
                console.log("Error Interceptor");
                return next.handle(request);
            } else {
                console.log("Eimai mesa sto Else tou error interceptor");
                const error = err.error?.message || err.statusText;
                // best solution is to output the error
                if (err instanceof HttpErrorResponse && err.status === 403) {
                    console.log("Error Interceptor");
                    this.snackbarService.error("Unauthorised to access these resources");
                } else {
                    this.snackbarService.error(err.error.message);
                }
                console.error(err);
                console.log("BGHKE APO TO ELSE");
                return throwError(error);
            }
        }));
    }
}