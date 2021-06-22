import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { SchoolDetailComponent } from "./school-detail/school-detail.component";
import { SchoolEditComponent } from "./school-edit/school-edit.component";
import { SchoolsComponent } from "./schools.component";

const routes: Routes = [
    { 
        path: '', component: SchoolsComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add', component: SchoolEditComponent },
            { path: 'detail/:id', component: SchoolDetailComponent},
            { path: 'edit/:id', component: SchoolEditComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SchoolsRoutingModule {}