import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { CourseScheduleDetailComponent } from "./course-schedule-detail/course-schedule-detail.component";
import { CourseScheduleEditComponent } from "./course-schedule-edit/course-schedule-edit.component";
import { CoursesSchedulesComponent } from "./courses-schedules.component";

const routes: Routes = [
    { 
        path: '', component: CoursesSchedulesComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add', component: CourseScheduleEditComponent },
            { path: 'detail/:id', component: CourseScheduleDetailComponent },
            { path: 'edit/:id', component: CourseScheduleEditComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CoursesSchedulesRoutingModule {}