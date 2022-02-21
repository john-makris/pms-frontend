import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { ClassSessionDetailComponent } from "./class-session-detail/class-session-detail.component";
import { ClassSessionEditComponent } from "./class-session-edit/class-session-edit.component";
import { ClassesSessionsComponent } from "./classes-sessions.component";

const routes: Routes = [
    { 
        path: '', component: ClassesSessionsComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add', 
                component: ClassSessionEditComponent,
                canActivate: [AuthGuard],
                data : {
                roles: ['ROLE_ADMIN', 'ROLE_TEACHER']
                }
            },
            { path: 'detail/:id',
                component: ClassSessionDetailComponent,
                canActivate: [AuthGuard],
                data : {
                roles: ['ROLE_ADMIN', 'ROLE_TEACHER']
                }
            },
            { path: 'edit/:id', 
                component: ClassSessionEditComponent,
                canActivate: [AuthGuard],
                data : {
                roles: ['ROLE_ADMIN', 'ROLE_TEACHER']
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ClassesSessionsRoutingModule {}