import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthUser } from 'src/app/users/auth-user.model';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent implements OnInit {
  @Output() closeSidenav = new EventEmitter<void>();
  isAuth: boolean = false;
  user!: AuthUser;

  private roles!: string[];
  showAdminFeatures = false;
  showProfessorFeatures = false;
  showStudentFeatures = false;
  showSecretaryFeatures = false;
  username!: string;

  private userSubscription!: Subscription;
  private deleteRefreshTokenSubscription!: Subscription;

  constructor(private authService: AuthService) { }

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
          this.showProfessorFeatures = this.roles.includes('ROLE_TEACHER');
          this.showStudentFeatures = this.roles.includes('ROLE_STUDENT');
          this.showSecretaryFeatures = this.roles.includes('ROLE_SECRETARY');
        } else {
          this.showAdminFeatures = false;
          this.showProfessorFeatures = false;
          this.showStudentFeatures = false;
          this.showSecretaryFeatures = false;
        }
      });
      console.log("WHAT??? " + this.isAuth);
    }
  
     onClose() {
      this.closeSidenav.emit();
    }

    onLogout(): void {
      this.deleteRefreshTokenSubscription = this.authService.deleteRefreshToken(this.user.id).subscribe(
        (data: any) => {
          console.log("Header Log out Message: "+data.message);
        }
      );
      this.authService.manualLogout();
      this.onClose();
    }
  
    ngOnDestroy() {
      if (this.userSubscription) {
        this.userSubscription.unsubscribe();
      }
      if (this.deleteRefreshTokenSubscription) {
        this.deleteRefreshTokenSubscription.unsubscribe();
      }
    }

}
