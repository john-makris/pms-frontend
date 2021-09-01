import { Injectable } from '@angular/core';
import { User } from '../users/user.model';

const TOKEN_KEY = 'auth-token';
const REFRESHTOKEN_KEY = 'auth-refreshtoken';
const USER_KEY = 'userData';
const VALID = 'logged-in-lifetime';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() { }

  clearLocalStorage(): void {
    localStorage.clear();
  }

  //+
  public saveToken(token: string, user: User): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);

      this.saveUser(user);
      console.log("User Access Token: "+user.accessToken);
  }
  //+ Mporei na xrisimopoihthei ka8e fora poy ananeonetai me expirationDuration anti gia expiresIn
  public saveValid(expirationDuration: number) {
    localStorage.setItem(VALID, expirationDuration.toString());
  }

  //+
  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  //+
  public saveRefreshToken(token: string): void {
    localStorage.removeItem(REFRESHTOKEN_KEY);
    localStorage.setItem(REFRESHTOKEN_KEY, token);
  }

  //+
  public getRefreshToken(): string | null {
    return localStorage.getItem(REFRESHTOKEN_KEY);
  }

  //+
  public saveUser(user: User): void {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  //+
  public getUser(): any {
    const userData: {
        id: number,
        username: string,
        email: string,
        roles: Array<string>,
        _accessToken: string,
        _tokenExpirationDate: Date,
        _refreshToken: string,
        _refreshTokenExpirationDate: Date
      } = JSON.parse(localStorage.getItem('userData')!);

    if (userData) {
        return userData;
    }

    return null;
  }
}
