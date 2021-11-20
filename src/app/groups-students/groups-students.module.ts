import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { GroupStudentDetailComponent } from "./group-student-detail/group-student-detail.component";
import { GroupStudentEditComponent } from "./group-student-edit/group-student-edit.component";
import { GroupStudentListComponent } from "./group-student-list/group-student-list.component";
import { GroupsStudentsRoutingModule } from "./groups-students-routing.module";
import { GroupsStudentsComponent } from "./groups-students.component";
import { ClassGroupSelectDialogComponent } from './group-student-list/dialogs/class-group-select-dialog/class-group-select-dialog.component';
import { StudentSelectDialogComponent } from './group-student-edit/dialogs/student-select-dialog/student-select-dialog.component';

@NgModule({
    declarations: [
        GroupsStudentsComponent,
        GroupStudentListComponent,
        GroupStudentEditComponent,
        GroupStudentDetailComponent,
        ClassGroupSelectDialogComponent,
        StudentSelectDialogComponent
    ],
    imports: [
        SharedModule,
        GroupsStudentsRoutingModule
    ]
})
export class GroupsStudentsModule {}