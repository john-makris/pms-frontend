import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { CourseDetailComponent } from "./course-detail/course-detail.component";
import { CourseEditComponent } from "./course-edit/course-edit.component";
import { CoursesComponent } from "./courses.component";

const routes: Routes = [
    { 
        path: '', component: CoursesComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add', component: CourseEditComponent },
            { path: 'detail/:id', component: CourseDetailComponent },
            { path: 'edit/:id', component: CourseEditComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CoursesRoutingModule {}