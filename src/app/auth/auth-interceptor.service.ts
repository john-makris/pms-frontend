import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { exhaustMap, take } from "rxjs/operators";
import { AuthService } from "./auth.service";

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authService.user.pipe(
            take(1),
            exhaustMap(user => {

                if (!user) {
                    return next.handle(req);
                }
                const modifiedRequest = req.clone({
                    headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + user.token)
                });
                return next.handle(modifiedRequest);
            })
        );
    }
}