import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'users',
  loadChildren: () => import('./users/users.module')
    .then(m => m.UsersModule),
    canLoad: [AuthGuard]
  },
  { path: 'schools',
  loadChildren: () => import('./schools/schools.module')
    .then(m => m.SchoolsModule),
    canLoad: [AuthGuard]
  },
  { path: 'departments',
  loadChildren: () => import('./departments/departments.module')
    .then(m => m.DepartmentsModule),
    canLoad: [AuthGuard]
  },
  { path: 'courses',
  loadChildren: () => import('./courses/courses.module')
    .then(m => m.CoursesModule),
    canLoad: [AuthGuard]
  }
  ,
  { path: 'courses-schedules',
  loadChildren: () => import('./courses-schedules/courses-schedules.module')
    .then(m => m.CoursesSchedulesModule),
    canLoad: [AuthGuard]
  },
  { path: 'lectures',
  loadChildren: () => import('./lectures/lectures.module')
    .then(m => m.LecturesModule),
    canLoad: [AuthGuard]
  },
  { path: 'classes-groups',
  loadChildren: () => import('./classes-groups/classes-groups.module')
    .then(m => m.ClassesGroupsModule),
    canLoad: [AuthGuard]
  },
  { path: 'students-of-groups',
  loadChildren: () => import('./groups-students/groups-students.module')
    .then(m => m.GroupsStudentsModule),
    canLoad: [AuthGuard]
  },
  { path: 'classes-sessions',
  loadChildren: () => import('./classes-sessions/classes-sessions.module')
    .then(m => m.ClassesSessionsModule),
    canLoad: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
