import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CourseDetailComponent } from "./course-detail/course-detail.component";
import { CourseEditComponent } from "./course-edit/course-edit.component";
import { CourseListComponent } from "./course-list/course-list.component";
import { CoursesRoutingModule } from "./courses-routing.module";
import { CoursesComponent } from "./courses.component";

@NgModule({
    declarations: [
        CoursesComponent,
        CourseDetailComponent,
        CourseListComponent,
        CourseEditComponent
    ],
    imports: [
        SharedModule,
        CoursesRoutingModule
    ]
})
export class CoursesModule {}