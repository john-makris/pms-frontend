import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/user/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() sidenavToggle = new EventEmitter<void>();
  isAuth: boolean = false;
  private userSubscription!: Subscription;
  user!: User;

  private roles!: string[];
  showAdminFeatures = false;
  showProfessorFearures = false;
  showStudentFearures = false;
  username!: string;

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
          this.showProfessorFearures = this.roles.includes('ROLE_PROFESSOR');
          this.showStudentFearures = this.roles.includes('ROLE_STUDENT');
        } else {
          this.showAdminFeatures = false;
          this.showProfessorFearures = false;
          this.showStudentFearures = false;
        }
      });
      console.log("WHAT??? " + this.isAuth);
    }
  
    onLogout(): void {
      this.authService.logout();
    }
  
    ngOnDestroy() {
      this.userSubscription.unsubscribe();
    }

    onToggleSidenav() {
      this.sidenavToggle.emit();
    }

}