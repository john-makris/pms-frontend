import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { EnsureDialogComponent } from "./ensure-dialog/ensure-dialog.component";


@NgModule({
    declarations: [
        EnsureDialogComponent
    ],
    imports: [
        SharedModule
    ]
})
export class DialogsModule {}