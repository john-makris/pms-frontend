import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { SchoolDetailComponent } from "./school-detail/school-detail.component";
import { SchoolEditComponent } from "./school-edit/school-edit.component";
import { SchoolListComponent } from "./school-list/school-list.component";
import { SchoolsRoutingModule } from "./schools-routing.module";
import { SchoolsComponent } from "./schools.component";


@NgModule({
    declarations: [
        SchoolsComponent,
        SchoolDetailComponent,
        SchoolListComponent,
        SchoolEditComponent
    ],
    imports: [
        SharedModule,
        SchoolsRoutingModule
    ]
})
export class SchoolsModule {}