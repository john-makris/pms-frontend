import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, filter, switchMap, take } from "rxjs/operators";
import { AuthService } from "./auth.service";
import { TokenRefreshResponse } from "./common/response/tokenRefreshResponse.interface";
import { TokenStorageService } from "./token-storage.service";

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private authService: AuthService,
        private tokenStorageService: TokenStorageService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
        let authReq = req;
        const token = this.tokenStorageService.getToken();
        if (token != null) {
            authReq = this.addTokenHeader(req, token);
        }
        console.log("Mesa ston Auth interceptor");
        return next.handle(authReq).pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && !authReq.url.includes('auth/signin') && error.status === 401) {
              console.log("Mesa sto if tou Auth interceptor");
              return this.handle401Error(authReq, next);
            }
            console.log("Ekso apo to if tou Auth interceptor");
            return throwError(error);        
        }));
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshTokenSubject.next(null);
    
          const token = this.tokenStorageService.getRefreshToken();
    
          if (token)
            return this.authService.refreshToken(token).pipe(
              switchMap((refreshTokenData: TokenRefreshResponse) => {
                this.isRefreshing = false;
    
                //this.tokenStorageService.saveToken(token.accessToken);
                this.authService.handleRefreshTokenAuthentication(refreshTokenData);
                this.refreshTokenSubject.next(refreshTokenData.accessToken);
                
                return next.handle(this.addTokenHeader(request, refreshTokenData.accessToken));
              }),
              catchError((err) => {
                this.isRefreshing = false;
                
                this.authService.manualLogout();
                return throwError(err);
              })
            );
        }
    
        return this.refreshTokenSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap((token) => next.handle(this.addTokenHeader(request, token)))
        );
    }

    private addTokenHeader(request: HttpRequest<any>, token: string) {
        return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
    }
}