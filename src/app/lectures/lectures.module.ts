import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { LectureDetailComponent } from "./lecture-detail/lecture-detail.component";
import { LectureEditComponent } from "./lecture-edit/lecture-edit.component";
import { LectureListComponent } from "./lecture-list/lecture-list.component";
import { LecturesRoutingModule } from "./lectures-routing.module";
import { LecturesComponent } from "./lectures.component";
import { CourseScheduleSelectDialogComponent } from './lecture-edit/dialogs/course-schedule-select-dialog/course-schedule-select.component';


@NgModule({
    declarations: [
        LecturesComponent,
        LectureDetailComponent,
        LectureListComponent,
        LectureEditComponent,
        CourseScheduleSelectDialogComponent
    ],
    imports: [
        SharedModule,
        LecturesRoutingModule
    ]
})
export class LecturesModule {}