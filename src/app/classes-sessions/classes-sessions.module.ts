import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { ClassSessionDetailComponent } from "./class-session-detail/class-session-detail.component";
import { ClassSessionEditComponent } from "./class-session-edit/class-session-edit.component";
import { ClassSessionListComponent } from "./class-session-list/class-session-list.component";
import { ClassesSessionsRoutingModule } from "./classes-sessions-routing.module";
import { ClassesSessionsComponent } from "./classes-sessions.component";

@NgModule({
    declarations: [
        ClassesSessionsComponent,
        ClassSessionListComponent,
        ClassSessionEditComponent,
        ClassSessionDetailComponent
    ],
    imports: [
        SharedModule,
        ClassesSessionsRoutingModule
    ]
})
export class ClassesSessionsModule {}