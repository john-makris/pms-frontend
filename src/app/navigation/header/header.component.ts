import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { first, last, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { TokenRefreshResponse } from 'src/app/auth/common/response/tokenRefreshResponse.interface';
import { TokenStorageService } from 'src/app/auth/token-storage.service';
import { AuthUser } from 'src/app/users/auth-user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() sidenavToggle = new EventEmitter<void>();
  isAuth: boolean = false;
  user!: AuthUser;

  endTime: string = "";
  refreshInterval: any;

  private roles!: string[];
  showAdminFeatures = false;
  showTeacherFeatures = false;
  showStudentFeatures = false;
  showSecretaryFeatures = false;
  username!: string;

  private userSubscription!: Subscription;
  private deleteRefreshTokenSubscription!: Subscription;
  private timerRefreshSubscription!: Subscription;
  private refreshTokenSubscription!: Subscription;

  constructor(private authService: AuthService,
              private tokenStorageService: TokenStorageService) { }

    ngOnInit(): void {
      this.userSubscription = this.authService.user.subscribe(currentUser => {
        this.isAuth = !!currentUser;
        if(currentUser) {
          this.user = currentUser;
          this.username = currentUser.username;
          this.roles = currentUser.roles;
          console.log("Hallo!");
          console.log("user: " + this.user.roles);
  
          this.showAdminFeatures = this.roles.includes('ROLE_ADMIN');
          this.showTeacherFeatures = this.roles.includes('ROLE_TEACHER');
          this.showStudentFeatures = this.roles.includes('ROLE_STUDENT');
          this.showSecretaryFeatures = this.roles.includes('ROLE_SECRETARY');
        } else {
          this.endTime = '';
          this.showAdminFeatures = false;
          this.showTeacherFeatures = false;
          this.showStudentFeatures = false;
        }
      });
      console.log("WHAT??? " + this.isAuth);


      this.timerRefreshSubscription = this.authService.timerRefresh.subscribe((result: boolean) => {
        console.log("RESULT: " + result);
        clearInterval(this.refreshInterval);
        if (result === true) {
          let initialTokenLife = localStorage.getItem('logged-in-lifetime')
          if (initialTokenLife !== null) {
            this.timer(+initialTokenLife);
          }
        }
      });

    }

    // extra field
    timer(initialTokenLife: number): void {
      let currentTokenLife = initialTokenLife / 1000;
      console.log("!!!!!!!!!!!currentTokenLife "+currentTokenLife);
      this.calcMinutesAndSeconds(currentTokenLife);
    }

    // extra field
    calcMinutesAndSeconds(tokenLife: number) {
      const date = new Date();

      let minutes = 0;
      let seconds = 0;
      if (tokenLife >= 60) {
        minutes = tokenLife / 60;
        seconds = tokenLife % 60;
      } else {
        minutes = 0;
        seconds = tokenLife;
      }

      minutes = +minutes.toString().split(".")[0];
      seconds = +seconds.toString().split(".")[0];


      //console.log("minutes: "+minutes.toString().split(".")[0]);
      //console.log("seconds: "+seconds.toString().split(".")[0]);

      this.refreshInterval = setInterval(() => {
        if (seconds > 0) {
          seconds = seconds -1;
          //console.log("minutes: "+minutes);
          //console.log("seconds: "+seconds);

        } else {
          minutes = minutes - 1;
          seconds = 59;
          //console.log("minutes: "+minutes);
          //console.log("seconds: "+seconds);
        }

        date.setMinutes(minutes);
        date.setSeconds(seconds);
        this.endTime = moment(date.getTime()).format("mm:ss");
        //console.log("Token Timer: "+this.endTime);

        if (minutes === 0 && seconds === 0) {
          clearInterval(this.refreshInterval);
        }

      }, 1000);

      this.authService.refreshInterval.next(this.refreshInterval);

    }

    onTokenRefresh() {
      const refreshToken = this.tokenStorageService.getRefreshToken();
      if (refreshToken) {
        this.refreshTokenSubscription = this.authService.refreshToken(refreshToken, this.user.id).subscribe(
          (refreshTokenData: TokenRefreshResponse) => {
            if (refreshTokenData) {
              this.authService.handleRefreshTokenAuthentication(refreshTokenData);
              this.authService.autoLogin();
            }
          }
        );
      }
    }
  
    onLogout(): void {
      this.deleteRefreshTokenSubscription = this.authService.deleteRefreshToken(this.user.id).subscribe(
        (data: any) => {
          console.log("Header Log out Message: "+data.message);
          clearInterval(this.refreshInterval);
        }
      );
      this.authService.manualLogout();
    }
  
    ngOnDestroy() {
      if (this.userSubscription) {
        this.userSubscription.unsubscribe();
      }
      if (this.deleteRefreshTokenSubscription) {
        this.deleteRefreshTokenSubscription.unsubscribe();
      }
      if (this.timerRefreshSubscription) {
        this.timerRefreshSubscription.unsubscribe();
      }
      if (this.refreshTokenSubscription) {
        this.refreshTokenSubscription.unsubscribe();
      }
    }

    onToggleSidenav() {
      this.sidenavToggle.emit();
    }

}