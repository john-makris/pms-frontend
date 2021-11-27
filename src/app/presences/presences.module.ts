import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { PresenceDetailComponent } from "./presence-detail/presence-detail.component";
import { PresenceEditComponent } from "./presence-edit/presence-edit.component";
import { PresenceListComponent } from "./presence-list/presence-list.component";
import { PresencesRoutingModule } from "./presences-routing.module";
import { PresencesComponent } from "./presences.component";

@NgModule({
    declarations: [
        PresencesComponent,
        PresenceDetailComponent,
        PresenceListComponent,
        PresenceEditComponent
    ],
    imports: [
        SharedModule,
        PresencesRoutingModule
    ]
})
export class PresencesModule {}