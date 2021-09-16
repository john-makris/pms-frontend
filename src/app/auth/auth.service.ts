import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, throwError } from 'rxjs';
import { Router } from "@angular/router";
import { AuthUser } from "../users/auth-user.model";
import { TokenStorageService } from "./token-storage.service";
import { AuthResponseData } from "./common/response/authResponseData.interface";
import { TokenRefreshResponse } from "./common/response/tokenRefreshResponse.interface";
import { Department } from "../departments/department.model";
import { MatDialog } from "@angular/material/dialog";


const AUTH_API = 'http://localhost:8080/pms/auth/';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({providedIn: 'root'})
export class AuthService {

    private logOutSubject = new BehaviorSubject<boolean>(false);

    logout$ = this.logOutSubject.asObservable();

    user = new BehaviorSubject<AuthUser | null>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient,
        private router: Router,
        private tokenStorageService: TokenStorageService,
        private matDialog: MatDialog) {}

    signup(firstname: string, lastname: string, username: string, email: string, password: string) {
        return this.http.post<string>(AUTH_API + 'signup', {
            firstname: firstname,
            lastname: lastname,
            username: username,
            email: email,
            password: password
        }, httpOptions);
    }

    login(username: string, password: string) {
        return this.http
        .post<AuthResponseData>(AUTH_API + 'signin', {
          username: username,
          password: password
        }, httpOptions).pipe(
            catchError(this.handleError),
            tap(resData => {
              console.log(resData.accessTokenExpiryDate);
                this.handleAuthentication(
                  resData.id,
                  resData.firstname,
                  resData.lastname,
                  resData.username,
                  resData.email,
                  resData.roles,
                  resData.accessToken,
                  resData.accessTokenExpiryDate,
                  resData.refreshToken,
                  resData.refreshTokenExpiryDate,
                  resData.department,
                  resData.status
                );
            })
        );
    }

    refreshToken(token: string) {
        return this.http.post<TokenRefreshResponse>(AUTH_API + 'refreshtoken', {
          refreshToken: token
        }, httpOptions).pipe(
            catchError(this.handleError),
            tap(refreshTokenData => {
            console.log("Refresh Token Expiry Date: "+ (new Date(refreshTokenData.refreshTokenExpiryDate).getTime() - new Date().getTime()));
            //this.handleRefreshTokenAuthentication(refreshTokenData);
          })
        );
    }

    handleRefreshTokenAuthentication(
        refreshTokenData: TokenRefreshResponse
        ) {
        // get each data
        const accessToken: string = refreshTokenData.accessToken;
        console.log("REFRESH TOKEN STUFF");
        console.log("Access Token: " + accessToken);
        const accessTokenExpiryDate: Date = refreshTokenData.accessTokenExpiryDate;
        console.log("accessTokenExpiryDate: " + accessTokenExpiryDate);
        const refreshToken: string = refreshTokenData.refreshToken;
        console.log("refreshToken: " + refreshToken);
        const refreshTokenExpiryDate: Date = refreshTokenData.refreshTokenExpiryDate;
        console.log("refreshTokenExpiryDate: " + refreshTokenExpiryDate);

        // get user
        const userData = this.tokenStorageService.getUser();

        if (!userData) {
            return;
        }

        console.log("accessTokenExpiryDate :", accessTokenExpiryDate);

        const accessTokenExpirationDate = new Date(accessTokenExpiryDate);
        //const accessTokenExpirationDuration = accessTokenExpirationDate.getTime() - new Date().getTime();

        const refreshTokenExpirationDate = new Date(refreshTokenExpiryDate);
        const refreshTokenExpirationDuration = refreshTokenExpirationDate.getTime() - new Date().getTime();

        console.log("accessTokenExpirationDate :" + accessTokenExpirationDate);
        console.log("CURRENT TIME :", new Date().getTime());

        const user = new AuthUser(
            userData.id,
            userData.firstname,
            userData.lastname,
            userData.username,
            userData.email,
            userData.roles,
            accessToken,
            accessTokenExpirationDate,
            refreshToken,
            refreshTokenExpirationDate,
            userData.department,
            userData.status
        );

        this.user.next(user);
        console.log("Token expires in: "+refreshTokenExpirationDuration);
        //localStorage.setItem('userData', JSON.stringify(user));
        this.tokenStorageService.saveToken(accessToken, user);
        this.tokenStorageService.saveRefreshToken(refreshToken);
        this.tokenStorageService.saveUser(user);
        // save valid
        this.tokenStorageService.saveValid(refreshTokenExpirationDuration);
        this.autoLogout(refreshTokenExpirationDuration);
  }

    autoLogin() {
        const userData = this.tokenStorageService.getUser();

        if (!userData) {
            return;
        }
        
        const loadedUser = new AuthUser(
          userData.id,
          userData.firstname,
          userData.lastname,
          userData.username,
          userData.email,
          userData.roles,
          userData._accessToken,
          new Date(userData._tokenExpirationDate),
          userData._refreshToken,
          new Date(userData._refreshTokenExpirationDate),
          userData.department,
          userData.status
        );

        if (loadedUser.accessToken) {
            console.log("Inside login loadedUser: "+loadedUser.username);
            this.user.next(loadedUser);
            const refreshTokenExpirationDuration =
                new Date(userData._refreshTokenExpirationDate).getTime() -
                new Date().getTime();
                console.log("I am inside auto-login !");
                console.log("refreshTokenExpirationDuration: " + refreshTokenExpirationDuration);
            // save valid
            this.tokenStorageService.saveValid(refreshTokenExpirationDuration);
            this.autoLogout(refreshTokenExpirationDuration);
        }
    }

    systemLogout() {
        this.matDialog.closeAll();
        this.manualLogout();
        this.logOutSubject.next(false);
    }

    manualLogout() {
        this.user.next(null);
        this.router.navigate(['/login']);
        //localStorage.removeItem('userData');
        this.tokenStorageService.clearLocalStorage();
        this.clearTimer();
    }

    autoLogout(expirationDuration: number) {
        console.log("Inside autoLogout: "+expirationDuration);
        this.clearTimer();
        this.tokenExpirationTimer = setTimeout(() => {
            console.log("APP EXPIRED");
            this.logOutSubject.next(true);
        }, expirationDuration);
    }

    deleteRefreshToken(userId: number) {
        console.log("I am inside deleteRefreshToken: "+userId);

        return this.http.delete<any>(AUTH_API + 'logout/'+ userId, httpOptions);
    }

    private handleAuthentication(
        id: number,
        firstname: string,
        lastname: string,
        username: string,
        email: string,
        roles: Array<string>,
        accessToken: string,
        accessTokenExpiryDate: Date,
        refreshToken: string,
        refreshTokenExpiryDate: Date,
        department: Department,
        status: boolean
        ) {
          console.log("id: ", id);
          console.log("accessTokenExpiryDate :", accessTokenExpiryDate);

      const accessTokenExpirationDate = new Date(accessTokenExpiryDate);
      // const accessTokenExpirationDuration = accessTokenExpirationDate.getTime() - new Date().getTime();

      const refreshTokenExpirationDate = new Date(refreshTokenExpiryDate);
      const refreshTokenExpirationDuration = refreshTokenExpirationDate.getTime() - new Date().getTime();

      console.log("accessTokenExpirationDate :" + accessTokenExpirationDate);
      console.log("CURRENT TIME :", new Date().getTime());

      const user = new AuthUser(
        id,
        firstname,
        lastname,
        username,
        email,
        roles,
        accessToken,
        accessTokenExpirationDate,
        refreshToken,
        refreshTokenExpirationDate,
        department,
        status
      );
        this.user.next(user);
        //localStorage.setItem('userData', JSON.stringify(user));
        this.tokenStorageService.saveToken(accessToken, user);
        this.tokenStorageService.saveRefreshToken(refreshToken);
        this.tokenStorageService.saveUser(user);
        // save valid
        this.tokenStorageService.saveValid(refreshTokenExpirationDuration);
        this.autoLogout(refreshTokenExpirationDuration);
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occured!';
    if (!errorRes.error || !errorRes.error.error) {
        // throw an error observable named errorMessage
        return throwError(errorMessage);
    }
    switch (errorRes.error.error) {
        case 'Unauthorized':
            errorMessage = 'Wrong username or password !';
            break;
    }
    // throw an error observable named errorMessage
    return throwError(errorMessage);
  }

  clearTimer() {
    if (this.tokenExpirationTimer) {
        clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }
}