import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { UserDetailComponent } from "./user-detail/user-detail.component";
import { UserEditComponent } from "./user-edit/user-edit.component";
import { UserComponent } from "./user.component";

const routes: Routes = [
    { 
        path: '', component: UserComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add', component: UserEditComponent },
            { path: 'detail/:id', component: UserDetailComponent },
            { path: 'edit/:id', component: UserEditComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule {}