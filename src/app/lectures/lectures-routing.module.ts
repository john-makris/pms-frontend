import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { LectureDetailComponent } from "./lecture-detail/lecture-detail.component";
import { LectureEditComponent } from "./lecture-edit/lecture-edit.component";
import { LecturesComponent } from "./lectures.component";

const routes: Routes = [
    { 
        path: '', component: LecturesComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add', component: LectureEditComponent },
            { path: 'detail/:id', component: LectureDetailComponent },
            { path: 'edit/:id', component: LectureEditComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LecturesRoutingModule {}