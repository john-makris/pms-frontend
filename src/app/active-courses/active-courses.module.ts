import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { ActiveCourseDetailComponent } from "./active-course-detail/active-course-detail.component";
import { ActiveCourseEditComponent } from "./active-course-edit/active-course-edit.component";
import { ActiveCourseListComponent } from "./active-course-list/active-course-list.component";
import { ActiveCoursesRoutingModule } from "./active-courses-routing.module";
import { ActiveCoursesComponent } from "./active-courses.component";
import { CourseAccordionComponent } from "./active-course-list/course-accordion/course-accordion.component";

@NgModule({
    declarations: [
        ActiveCoursesComponent,
        ActiveCourseDetailComponent,
        ActiveCourseListComponent,
        ActiveCourseEditComponent,
        CourseAccordionComponent
    ],
    imports: [
        SharedModule,
        ActiveCoursesRoutingModule
    ]
})
export class ActiveCoursesModule {}