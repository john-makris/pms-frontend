import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { PresenceDetailComponent } from "./presence-detail/presence-detail.component";
import { PresenceEditComponent } from "./presence-edit/presence-edit.component";
import { ClassSessionSelectDialogComponent } from "./presence-list/dialogs/class-session-select-dialog/class-session-select-dialog.component";
import { PresenceListComponent } from "./presence-list/presence-list.component";
import { PresencesRoutingModule } from "./presences-routing.module";
import { PresencesComponent } from "./presences.component";

@NgModule({
    declarations: [
        PresencesComponent,
        PresenceDetailComponent,
        PresenceListComponent,
        PresenceEditComponent,
        ClassSessionSelectDialogComponent
    ],
    imports: [
        SharedModule,
        PresencesRoutingModule
    ]
})
export class PresencesModule {}