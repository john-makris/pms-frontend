import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { ClassesGroupsRoutingModule } from "./classes-groups-routing.module";
import { ClassesGroupsComponent } from "./classes-groups.component";


@NgModule({
    declarations: [
        ClassesGroupsComponent
    ],
    imports: [
        SharedModule,
        ClassesGroupsRoutingModule
    ]
})
export class ClassesGroupsModule {}