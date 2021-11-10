import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { ClassGroupDetailComponent } from "./class-group-detail/class-group-detail.component";
import { ClassGroupEditComponent } from "./class-group-edit/class-group-edit.component";
import { ClassesGroupsComponent } from "./classes-groups.component";

const routes: Routes = [
    { 
        path: '', component: ClassesGroupsComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add', component: ClassGroupEditComponent },
            { path: 'detail/:id', component: ClassGroupDetailComponent },
            { path: 'edit/:id', component: ClassGroupEditComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ClassesGroupsRoutingModule {}