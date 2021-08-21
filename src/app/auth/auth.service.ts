import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, throwError } from 'rxjs';
import { Router } from "@angular/router";
import { User } from "../user/user.model";
import { TokenStorageService } from "./token-storage.service";

const AUTH_API = 'http://localhost:8080/pms/auth/';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export interface AuthRequestData {
    username: string;
    email?: string;
    password: string;
}

export interface AuthResponseData {
    id: number;
    username: string;
    email: string;
    roles: Array<string>;
    tokenType: string;
    accessToken: string;
    accessTokenExpiryDate: Date;
    refreshToken: string;
    refreshTokenExpiryDate: Date;
}

export interface TokenRefreshResponse {
    tokenType: string;
    accessToken: string;
    accessTokenExpiryDate: Date;
	refreshToken: string;
	refreshTokenExpiryDate: Date;
}

@Injectable({providedIn: 'root'})
export class AuthService {
    isAutoLogin: boolean = false;
    user = new BehaviorSubject<User | null>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient,
        private router: Router,
        private tokenStorageService: TokenStorageService) {}

    signup(username: string, email: string, password: string) {
        return this.http.post<string>(AUTH_API + 'signup', {
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
                  resData.username,
                  resData.email,
                  resData.roles,
                  resData.accessToken,
                  resData.accessTokenExpiryDate,
                  resData.refreshToken,
                  resData.refreshTokenExpiryDate
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

        const user = new User(
            userData.id,
            userData.username,
            userData.email,
            userData.roles,
            accessToken,
            accessTokenExpirationDate,
            refreshToken,
            refreshTokenExpirationDate
        );

        this.user.next(user);
        console.log("To token ligei se: "+refreshTokenExpirationDuration);
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
        
        const loadedUser = new User(
          userData.id,
          userData.username,
          userData.email,
          userData.roles,
          userData._accessToken,
          new Date(userData._tokenExpirationDate),
          userData._refreshToken,
          new Date(userData._refreshTokenExpirationDate),
        );

        if (loadedUser.accessToken) {
            console.log("Inside login loadedUser: "+loadedUser.username);
            this.user.next(loadedUser);
            const refreshTokenExpirationDuration =
                new Date(userData._refreshTokenExpirationDate).getTime() -
                new Date().getTime();
                console.log("Eimai mesa sto auto-login !");
                console.log("refreshTokenExpirationDuration: " + refreshTokenExpirationDuration);
            // save valid
            this.tokenStorageService.saveValid(refreshTokenExpirationDuration);
            this.autoLogout(refreshTokenExpirationDuration);
        }
    }

    logout() {
        this.user.next(null);
        this.router.navigate(['/login']);
        //localStorage.removeItem('userData');
        this.tokenStorageService.signOut();
        this.clearTimer();
    }

    autoLogout(expirationDuration: number) {
        console.log("Mesa sto autoLogout: "+expirationDuration);
        this.clearTimer();
        this.tokenExpirationTimer = setTimeout(() => {
            console.log("ELIKSA");
            this.logout();
        }, expirationDuration);
    }

    private handleAuthentication(
        id: number,
        username: string,
        email: string,
        roles: Array<string>,
        accessToken: string,
        accessTokenExpiryDate: Date,
        refreshToken: string,
        refreshTokenExpiryDate: Date
        ) {
          console.log("id: ", id);
          console.log("accessTokenExpiryDate :", accessTokenExpiryDate);

      const accessTokenExpirationDate = new Date(accessTokenExpiryDate);
      // const accessTokenExpirationDuration = accessTokenExpirationDate.getTime() - new Date().getTime();

      const refreshTokenExpirationDate = new Date(refreshTokenExpiryDate);
      const refreshTokenExpirationDuration = refreshTokenExpirationDate.getTime() - new Date().getTime();

      console.log("accessTokenExpirationDate :" + accessTokenExpirationDate);
      console.log("CURRENT TIME :", new Date().getTime());

      const user = new User(
        id,
        username,
        email,
        roles,
        accessToken,
        accessTokenExpirationDate,
        refreshToken,
        refreshTokenExpirationDate
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