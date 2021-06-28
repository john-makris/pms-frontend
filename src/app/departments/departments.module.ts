import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { DepartmentDetailComponent } from "./department-detail/department-detail.component";
import { DepartmentEditComponent } from "./department-edit/department-edit.component";
import { DepartmentListComponent } from "./department-list/department-list.component";
import { DepartmentsRoutingModule } from "./departments-routing.module";
import { DepartmentsComponent } from "./departments.component";

@NgModule({
    declarations: [
        DepartmentsComponent,
        DepartmentDetailComponent,
        DepartmentListComponent,
        DepartmentEditComponent
    ],
    imports: [
        SharedModule,
        DepartmentsRoutingModule
    ]
})
export class DepartmentsModule {}