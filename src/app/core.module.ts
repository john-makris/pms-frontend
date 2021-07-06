import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { SchoolService } from "./schools/school.service";
import { AuthInterceptorService } from "./auth/auth-interceptor.service";
import { DepartmentService } from "./departments/department.service";

@NgModule({
    providers: [
        SchoolService,
        DepartmentService,
        { 
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true
        }
    ]
})
export class CoreModule {}