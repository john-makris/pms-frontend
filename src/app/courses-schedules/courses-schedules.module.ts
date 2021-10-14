import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CourseScheduleDetailComponent } from "./course-schedule-detail/course-schedule-detail.component";
import { CourseScheduleEditComponent } from "./course-schedule-edit/course-schedule-edit.component";
import { CourseScheduleListComponent } from "./course-schedule-list/course-schedule-list.component";
import { CoursesSchedulesRoutingModule } from "./courses-schedules-routing.module";
import { CoursesSchedulesComponent } from "./courses-schedules.component";
import { CourseSelectDialogComponent } from './course-schedule-edit/dialogs/course-select-dialog/course-select-dialog.component';
import { TeachersSelectDialogComponent } from './course-schedule-edit/dialogs/teachers-select-dialog/teachers-select-dialog.component';
import { StudentsPreviewDialogComponent } from './course-schedule-detail/dialogs/students-preview-dialog/students-preview-dialog.component';

@NgModule({
    declarations: [
        CoursesSchedulesComponent,
        CourseScheduleDetailComponent,
        CourseScheduleListComponent,
        CourseScheduleEditComponent,
        CourseSelectDialogComponent,
        TeachersSelectDialogComponent,
        StudentsPreviewDialogComponent
    ],
    imports: [
        SharedModule,
        CoursesSchedulesRoutingModule
    ]
})
export class CoursesSchedulesModule {}