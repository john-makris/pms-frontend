import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService, TokenRefreshResponse } from './auth/auth.service';
import { TokenStorageService } from './auth/token-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'pms-frontend';
  refreshTokenSubscription!: Subscription;

  constructor(private authService: AuthService,
    private tokenStorageService: TokenStorageService) {}

  ngOnInit() {
    const currentUser = this.tokenStorageService.getUser();
    this.authService.user.next(currentUser);
    
    const refreshToken = this.tokenStorageService.getRefreshToken();
    const accessTokenExpirationDate = this.tokenStorageService.getUser()?._tokenExpirationDate;
    console.log("APP COMPO ACCESSTOKEN EXPIRES: "+accessTokenExpirationDate);

    console.log("Token exists: "+refreshToken);
    if (refreshToken && (accessTokenExpirationDate && new Date() < new Date(accessTokenExpirationDate))) {
      this.refreshTokenSubscription = this.authService.refreshToken(refreshToken).subscribe(
        (refreshTokenData: TokenRefreshResponse) => {
          if (refreshTokenData) {
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
  }

  ngOnDestroy(): void {
    console.log("APP COMPONENT DESTROY");
    this.refreshTokenSubscription.unsubscribe();
  }

}
