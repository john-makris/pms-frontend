import { Department } from "../departments/department.model";

export class User {

    constructor(
      public id: number,
      public username: string,
      public email: string,
      public roles: Array<string>,
      public _accessToken: string,
      private _tokenExpirationDate: Date,
      private _refreshToken: string,
      private _refreshTokenExpirationDate: Date,
      public department: Department,
      public status: boolean,
      public am?: number
    ) {}
  
    get accessToken() {
      if(!this._tokenExpirationDate || new Date() > new Date(this._tokenExpirationDate)) {
        return null;
      }
      return this._accessToken;
    }

    get refreshToken() {
      if(!this._refreshTokenExpirationDate || new Date() > new Date(this._refreshTokenExpirationDate)) {
        return null;
      }
      return this._refreshToken;
    }
}