import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { TokenRefreshResponse } from './auth/common/response/tokenRefreshResponse.interface';
import { TokenStorageService } from './auth/token-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'pms-frontend';
  refreshTokenExpirationDate!: Date;

  private refreshTokenSubscription!: Subscription;
  private logoutSubscription!: Subscription;
  private deleteRefreshTokenSubscription!: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private tokenStorageService: TokenStorageService) {}

  ngOnInit() {
    const currentUser = this.tokenStorageService.getUser();
    console.log("APP COMPONENT currentUser: "+currentUser);
    this.authService.user.next(currentUser);
    
    const refreshToken = this.tokenStorageService.getRefreshToken();
    const accessTokenExpirationDate = this.tokenStorageService.getUser()?._tokenExpirationDate;
    console.log("APP COMPO ACCESSTOKEN EXPIRES: "+accessTokenExpirationDate);

    console.log("Token exists: "+refreshToken);
    if (refreshToken && (accessTokenExpirationDate && new Date() < new Date(accessTokenExpirationDate))) {
      this.refreshTokenSubscription = this.authService.refreshToken(refreshToken).subscribe(
        (refreshTokenData: TokenRefreshResponse) => {
          if (refreshTokenData) {
            this.refreshTokenExpirationDate = refreshTokenData.refreshTokenExpiryDate;
            this.authService.handleRefreshTokenAuthentication(refreshTokenData);
            console.log("AUTOLOGIN DATA: " + (new Date(refreshTokenData.refreshTokenExpiryDate).getTime()- new Date().getTime()));
            this.authService.autoLogin();
          }
        }
      );
    } else {
      console.log("Mpika sto else xoris refresh");
      this.authService.autoLogin();
    }

    this.logoutSubscription = this.authService.logout$.subscribe(
      (status: boolean) => {
        if (status) {
          console.log("It's time to LOG OUT ! "+this.tokenStorageService.getUser().id);
          this.deleteRefreshTokenSubscription = this.authService.deleteRefreshToken(this.tokenStorageService.getUser().id).subscribe(
            (data: any) => {
              console.log("Message: "+data.message);
            }
          );
          this.authService.systemLogout();
        }
      }
    );

    

  }

  ngOnDestroy(): void {
    console.log("APP COMPONENT DESTROY");
    if (this.refreshTokenSubscription) {
      this.refreshTokenSubscription.unsubscribe();
    }
    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }
    if (this.deleteRefreshTokenSubscription) {
      this.deleteRefreshTokenSubscription.unsubscribe();
    }
  }

}
