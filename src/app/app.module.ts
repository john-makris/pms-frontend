import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './navigation/header/header.component';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaterialModule } from './material.module';
import { AuthModule } from './auth/auth.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { SchoolsModule } from './schools/schools.module';
import { CoreModule } from './core.module';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';
import { DialogsModule } from './common/dialogs/dialogs.module';
import { DepartmentsModule } from './departments/departments.module';
import { CoursesModule } from './courses/courses.module';
import { CoursesSchedulesModule } from './courses-schedules/courses-schedules.module';
import { UsersModule } from './users/users.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidenavListComponent,
    WelcomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    AppRoutingModule,
    FlexLayoutModule,
    AuthModule,
    CoreModule,
    DialogsModule,
    UsersModule,
    SchoolsModule,
    DepartmentsModule,
    CoursesModule,
    CoursesSchedulesModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
