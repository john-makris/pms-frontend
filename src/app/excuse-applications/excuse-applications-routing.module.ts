import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { ExcuseApplicationDetailComponent } from "./excuse-application-detail/excuse-application-detail.component";
import { ExcuseApplicationEditComponent } from "./excuse-application-edit/excuse-application-edit.component";
import { ExcuseApplicationsComponent } from "./excuse-applications.component";

const routes: Routes = [
    { 
        path: '', component: ExcuseApplicationsComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add', 
                component: ExcuseApplicationEditComponent,
                canActivate: [AuthGuard],
                data : {
                    roles: ['ROLE_ADMIN', 'ROLE_STUDENT']
                }
            },
            { path: 'detail/:id', component: ExcuseApplicationDetailComponent },
            { path: 'edit/:id', 
                component: ExcuseApplicationEditComponent,
                canActivate: [AuthGuard],
                data : {
                    roles: ['ROLE_ADMIN', 'ROLE_SECRETARY']
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExcuseApplicationsRoutingModule {}