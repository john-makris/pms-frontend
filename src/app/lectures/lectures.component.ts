import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SnackbarService } from '../common/snackbars/snackbar.service';
import { AuthUser } from '../users/auth-user.model';

@Component({
  selector: 'app-lectures',
  templateUrl: './lectures.component.html',
  styleUrls: ['./lectures.component.css']
})
export class LecturesComponent implements OnInit {

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
          this.showStudentFeatures = this.currentUser.roles.includes('ROLE_STUDENT');
        }
      });

      if (this.showStudentFeatures) {
        this.snackbarService.error("Unauthorised to access these resources");
      }      

    }

}
