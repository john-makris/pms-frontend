import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { LecturesComponent } from "../lectures/lectures.component";
import { ClassGroupDetailComponent } from "./class-group-detail/class-group-detail.component";
import { ClassGroupEditComponent } from "./class-group-edit/class-group-edit.component";

const routes: Routes = [
    { 
        path: '', component: LecturesComponent,
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