import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SnackbarService } from '../common/snackbars/snackbar.service';
import { AuthUser } from '../users/auth-user.model';

@Component({
  selector: 'app-excuse-applications',
  templateUrl: './excuse-applications.component.html',
  styleUrls: ['./excuse-applications.component.css']
})
export class ExcuseApplicationsComponent implements OnInit {

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService
    ) { }

    ngOnInit(): void {
      this.authService.user.subscribe((user: AuthUser | null) => {
        if (user) {
          this.currentUser = user;
          this.currentUserId = this.currentUser.id;
          this.showTeacherFeatures = this.currentUser.roles.includes('ROLE_TEACHER');
  
          if (this.showTeacherFeatures) {
            this.snackbarService.error("Unauthorised to access these resources");
            this.router.navigate(['../'], { relativeTo: this.route});
          }
        }
      });
  
    }

}
