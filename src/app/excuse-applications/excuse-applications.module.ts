import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { ExcuseApplicationDetailComponent } from "./excuse-application-detail/excuse-application-detail.component";
import { ExcuseApplicationEditComponent } from "./excuse-application-edit/excuse-application-edit.component";
import { ExcuseApplicationListComponent } from "./excuse-application-list/excuse-application-list.component";
import { ExcuseApplicationsRoutingModule } from "./excuse-applications-routing.module";
import { ExcuseApplicationsComponent } from "./excuse-applications.component";
import { PresenceSelectDialogComponent } from './excuse-application-edit/dialogs/presence-select-dialog/presence-select-dialog.component';

@NgModule({
    declarations: [
        ExcuseApplicationsComponent,
        ExcuseApplicationListComponent,
        ExcuseApplicationEditComponent,
        ExcuseApplicationDetailComponent,
        PresenceSelectDialogComponent
    ],
    imports: [
        SharedModule,
        ExcuseApplicationsRoutingModule
    ]
})
export class ExcuseApplicationsModule {}