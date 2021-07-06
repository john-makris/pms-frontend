import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { SchoolService } from "./schools/school.service";
import { AuthInterceptorService } from "./auth/auth-interceptor.service";
import { DepartmentService } from "./departments/department.service";
import { SchoolsDepartmentService } from "./departments/schools-department.service";

@NgModule({
    providers: [
        SchoolService,
        DepartmentService,
        SchoolsDepartmentService,
        { 
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true
        }
    ]
})
export class CoreModule {}