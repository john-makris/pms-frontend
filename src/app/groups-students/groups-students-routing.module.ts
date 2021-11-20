import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { GroupStudentDetailComponent } from "./group-student-detail/group-student-detail.component";
import { GroupStudentEditComponent } from "./group-student-edit/group-student-edit.component";
import { GroupsStudentsComponent } from "./groups-students.component";

const routes: Routes = [
    { 
        path: '', component: GroupsStudentsComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add', component: GroupStudentEditComponent },
            { path: 'detail/:studentId/:classGroupId', component: GroupStudentDetailComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GroupsStudentsRoutingModule {}