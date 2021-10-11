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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
