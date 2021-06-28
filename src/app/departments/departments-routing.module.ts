import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { DepartmentDetailComponent } from "./department-detail/department-detail.component";
import { DepartmentEditComponent } from "./department-edit/department-edit.component";
import { DepartmentsComponent } from "./departments.component";

const routes: Routes = [
    { 
        path: '', component: DepartmentsComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add', component: DepartmentEditComponent },
            { path: 'detail/:id', component: DepartmentDetailComponent },
            { path: 'edit/:id', component: DepartmentEditComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DepartmentsRoutingModule {}