import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { ProfileDetailsComponent } from "./profile-details/profile-details.component";
import { ProfileComponent } from "./profile.component";

const routes: Routes = [
    { 
        path: '', component: ProfileComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'details', component: ProfileDetailsComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule {}