import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { PresenceDetailComponent } from "./presence-detail/presence-detail.component";
import { PresenceEditComponent } from "./presence-edit/presence-edit.component";
import { PresencesComponent } from "./presences.component";

const routes: Routes = [
    { 
        path: '', component: PresencesComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'add', component: PresenceEditComponent },
            { path: 'detail/:id', component: PresenceDetailComponent },
            { path: 'edit/:id', component: PresenceEditComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PresencesRoutingModule {}