import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { ClassGroupDetailComponent } from "./class-group-detail/class-group-detail.component";
import { ClassGroupEditComponent } from "./class-group-edit/class-group-edit.component";
import { ClassGroupListComponent } from "./class-group-list/class-group-list.component";
import { ClassesGroupsRoutingModule } from "./classes-groups-routing.module";
import { ClassesGroupsComponent } from "./classes-groups.component";


@NgModule({
    declarations: [
        ClassesGroupsComponent,
        ClassGroupListComponent,
        ClassGroupEditComponent,
        ClassGroupDetailComponent
    ],
    imports: [
        SharedModule,
        ClassesGroupsRoutingModule
    ]
})
export class ClassesGroupsModule {}