import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { ChangePersonalDetailsComponent } from "./profile-details/dialogs/change-personal-details-dialog/change-personal-details/change-personal-details.component";
import { ProfileDetailsComponent } from "./profile-details/profile-details.component";
import { ProfileRoutingModule } from "./profile-routing.module";
import { ProfileComponent } from "./profile.component";


@NgModule({
    declarations: [
        ProfileComponent,
        ProfileDetailsComponent,
        ChangePersonalDetailsComponent
    ],
    imports: [
        SharedModule,
        ProfileRoutingModule
    ]
})
export class ProfileModule {}