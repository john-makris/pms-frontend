import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { UserDetailComponent } from "./user-detail/user-detail.component";
import { UserEditComponent } from "./user-edit/user-edit.component";
import { UserListComponent } from "./user-list/user-list.component";
import { UserComponent } from "./user.component";
import { UsersRoutingModule } from "./users-routing.module";
import { UploadStudentsComponent } from './upload-students/upload-students.component';

@NgModule({
    declarations: [
        UserComponent,
        UserDetailComponent,
        UserListComponent,
        UserEditComponent,
        UploadStudentsComponent
    ],
    imports: [
        SharedModule,
        UsersRoutingModule
    ]
})
export class UsersModule {}