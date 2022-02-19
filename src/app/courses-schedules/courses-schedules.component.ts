import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AuthUser } from '../users/auth-user.model';

@Component({
  selector: 'app-courses-schedules',
  templateUrl: './courses-schedules.component.html',
  styleUrls: ['./courses-schedules.component.css']
})
export class CoursesSchedulesComponent implements OnInit {

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
    ) { }

    ngOnInit(): void {
      this.authService.user.subscribe((user: AuthUser | null) => {
        if (user) {
          this.currentUser = user;
          this.currentUserId = this.currentUser.id;
          this.showAdminFeatures = this.currentUser.roles.includes('ROLE_ADMIN');
  
          if (!this.showAdminFeatures) {
            this.router.navigate(['../'], { relativeTo: this.route});
          }
        }
      });
  
    }

}