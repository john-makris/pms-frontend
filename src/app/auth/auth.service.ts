import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, throwError } from 'rxjs';
import { Router } from "@angular/router";
import { User } from "../user/user.model";

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
    accessToken: string;
    type: string;
    jwtExpirationMs: number;
    username: string;
    email: string;
    roles: Array<string>;
}

@Injectable({providedIn: 'root'})
export class AuthService {
    user = new BehaviorSubject<User | null>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient,
        private router: Router) {}

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
              console.log(resData.jwtExpirationMs);
                this.handleAuthentication(
                  resData.id,
                  resData.username,
                  resData.email,
                  resData.roles,
                  resData.accessToken,
                  resData.jwtExpirationMs
                );
            })
        );
    }

    autoLogin() {
        const userData: {
          id: number,
          username: string,
          email: string,
          roles: Array<string>,
          _token: string,
          _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userData')!);

        if (!userData) {
            return;
        }

        const loadedUser = new User(
          userData.id,
          userData.username,
          userData.email,
          userData.roles,
          userData._token,
          new Date(userData._tokenExpirationDate)
        );

        if (loadedUser.token) {
            this.user.next(loadedUser);
            const expirationDuration =
                new Date(userData._tokenExpirationDate).getTime() -
                new Date().getTime();
                console.log("expirationDuration: " + expirationDuration);
            this.autoLogout(expirationDuration);
        }
    }

    logout() {
        this.user.next(null);
        this.router.navigate(['/login']);
        localStorage.removeItem('userData');
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationDuration: number) {
        console.log(expirationDuration);
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    private handleAuthentication(
        id: number,
        username: string,
        email: string,
        roles: Array<string>,
        token: string,
        expiresInMs: number) {
          console.log("id: ", id);
          console.log("expiresInMs :", expiresInMs);

      const expirationDate = new Date(
        new Date().getTime() + expiresInMs
      );
      console.log("expirationDate :" + expirationDate);
      console.log("CURRENT TIME :", new Date().getTime());
      console.log("expiresInMs :", expiresInMs);

      const user = new User(
        id,
        username,
        email,
        roles,
        token,
        expirationDate
      );
        this.user.next(user);
        this.autoLogout(expiresInMs);
        localStorage.setItem('userData', JSON.stringify(user));
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
}