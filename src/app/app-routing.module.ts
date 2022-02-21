import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'home', component: WelcomeComponent },
  { path: 'users',
  loadChildren: () => import('./users/users.module')
    .then(m => m.UsersModule),
    canActivate: [AuthGuard],
    data : {
      roles: ['ROLE_ADMIN']
    }
  },
  { path: 'schools',
  loadChildren: () => import('./schools/schools.module')
    .then(m => m.SchoolsModule),
    canActivate: [AuthGuard],
    data : {
      roles: ['ROLE_ADMIN']
    }
  },
  { path: 'departments',
  loadChildren: () => import('./departments/departments.module')
    .then(m => m.DepartmentsModule),
    canActivate: [AuthGuard],
    data : {
      roles: ['ROLE_ADMIN']
    }
  },
  { path: 'courses',
  loadChildren: () => import('./courses/courses.module')
    .then(m => m.CoursesModule),
    canActivate: [AuthGuard],
    data : {
      roles: ['ROLE_ADMIN']
    }
  },
  { path: 'courses-schedules',
  loadChildren: () => import('./courses-schedules/courses-schedules.module')
    .then(m => m.CoursesSchedulesModule),
    canActivate: [AuthGuard],
    data : {
      roles: ['ROLE_ADMIN']
    }
  },
  { path: 'lectures',
  loadChildren: () => import('./lectures/lectures.module')
    .then(m => m.LecturesModule),
    canActivate: [AuthGuard],
    data : {
      roles: ['ROLE_ADMIN', 'ROLE_TEACHER']
    }
  },
  { path: 'classes-groups',
  loadChildren: () => import('./classes-groups/classes-groups.module')
    .then(m => m.ClassesGroupsModule),
    canActivate: [AuthGuard],
    data : {
      roles: ['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT']
    }
  },
  { path: 'students-of-groups',
  loadChildren: () => import('./groups-students/groups-students.module')
    .then(m => m.GroupsStudentsModule),
    canActivate: [AuthGuard],
    data : {
      roles: ['ROLE_ADMIN', 'ROLE_TEACHER']
    }
  },
  { path: 'classes-sessions',
  loadChildren: () => import('./classes-sessions/classes-sessions.module')
    .then(m => m.ClassesSessionsModule),
    canActivate: [AuthGuard],
    data : {
      roles: ['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT']
    }
  },
  { path: 'presences',
  loadChildren: () => import('./presences/presences.module')
    .then(m => m.PresencesModule),
    canActivate: [AuthGuard],
    data : {
      roles: ['ROLE_ADMIN', 'ROLE_TEACHER']
    }
  },
  { path: 'excuse-applications',
  loadChildren: () => import('./excuse-applications/excuse-applications.module')
    .then(m => m.ExcuseApplicationsModule),
    canActivate: [AuthGuard],
    data : {
      roles: ['ROLE_ADMIN', 'ROLE_STUDENT', 'ROLE_SECRETARY']
    }
  },
  { path: 'profile',
  loadChildren: () => import('./profile/profile.module')
    .then(m => m.ProfileModule),
    canLoad: [AuthGuard]
  },
  { path: 'login', redirectTo: 'login'},
  { path: 'signup', redirectTo: 'signup'},
  { path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
