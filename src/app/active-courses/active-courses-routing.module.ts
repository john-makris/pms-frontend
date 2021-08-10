import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { ActiveCourseDetailComponent } from "./active-course-detail/active-course-detail.component";
import { ActiveCourseEditComponent } from "./active-course-edit/active-course-edit.component";
import { ActiveCoursesComponent } from "./active-courses.component";

const routes: Routes = [
    { 
        path: '', component: ActiveCoursesComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add/:id', component: ActiveCourseEditComponent },
            { path: 'detail/:id', component: ActiveCourseDetailComponent },
            { path: 'edit/:id', component: ActiveCourseEditComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ActiveCoursesRoutingModule {}