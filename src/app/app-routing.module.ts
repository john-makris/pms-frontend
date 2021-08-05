import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'schools',
  loadChildren: () => import('./schools/schools.module')
    .then(m => m.SchoolsModule)
  },
  { path: 'departments',
  loadChildren: () => import('./departments/departments.module')
    .then(m => m.DepartmentsModule)
  },
  { path: 'courses',
  loadChildren: () => import('./courses/courses.module')
    .then(m => m.CoursesModule)
  }
  ,
  { path: 'active-courses',
  loadChildren: () => import('./active-courses/active-courses.module')
    .then(m => m.ActiveCoursesModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
