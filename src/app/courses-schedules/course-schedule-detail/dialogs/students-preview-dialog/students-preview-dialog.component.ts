import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { TeachersSelectDialogComponent } from 'src/app/courses-schedules/course-schedule-edit/dialogs/teachers-select-dialog/teachers-select-dialog.component';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { UsersDataSource } from 'src/app/users/common/tableDataHelper/users.datasource';
import { UserService } from 'src/app/users/user.service';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { ClassSessionService } from 'src/app/classes-sessions/class-session.service';
import { ClassSessionResponseData } from 'src/app/classes-sessions/common/payload/response/classSessionResponseData.interface';
import { AuthUser } from 'src/app/users/auth-user.model';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-students-preview-dialog',
  templateUrl: './students-preview-dialog.component.html',
  styleUrls: ['./students-preview-dialog.component.css']
})
export class StudentsPreviewDialogComponent implements OnInit, OnDestroy {

  dialogStarted: boolean = true;
  isLoading: boolean = false;
  submitted: boolean = false;

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;
  
  delimeter: string = '\n';

  dataSource!: UsersDataSource;

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';

  currentCourseSchedule: CourseSchedule | null = null;
  currentClassSession: ClassSessionResponseData | null = null;

  classSessionSubscription!: Subscription;
  courseScheduleSubscription!: Subscription;
  departmentIdSubscription!: Subscription;
  pageDetailSubscription!: Subscription;

  displayedColumns = [
    'id',
    'username',
    'firstname',
    'lastname'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  constructor(
    private userService: UserService,
    private courseScheduleService: CourseScheduleService,
    private classSessionService: ClassSessionService,
    private dialogRef: MatDialogRef<TeachersSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any,
    private authService: AuthService) {}


  ngOnInit(): void {

    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.currentUserId = this.currentUser.id;
        console.log("Current User Id: "+this.currentUserId);

        this.showAdminFeatures = this.currentUser.roles.includes('ROLE_ADMIN');
        this.showTeacherFeatures = this.currentUser.roles.includes('ROLE_TEACHER');
        this.showStudentFeatures = this.currentUser.roles.includes('ROLE_STUDENT');
        
      }
    });

    this.dataSource = new UsersDataSource(this.userService);
    console.log("data identifier: "+this.data.identifier);
    console.log("data searchId: "+this.data.searchId);
    if (this.data.identifier && this.data.identifier.includes('session')) {
      this.dataSource.loadClassSessionStudents(this.currentUserId, this.data.searchId,'', 0, 3, 'asc', this.currentColumnDef);
    } else {
      this.dataSource.loadCourseScheduleStudents(this.data.searchId,'', 0, 3, 'asc', this.currentColumnDef);
    }

    this.pageDetailSubscription = this.dataSource.pageDetailState.pipe(
      switchMap(async (pageDetail: PageDetail) => {
        this.totalItems = pageDetail.totalItems;
        this.currentPageItems = pageDetail.currentPageItems;
        this.currentPage = pageDetail.currentPage;
        console.log("I am inside pageDetailSubscription switchMap");
      })
    ).subscribe();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => {
      this.currentColumnDef = this.sort.active;
      //console.log("SORT ACTIVE: "+this.sort.active);
    //console.log("Sort changed "+this.sort.direction);
      this.paginator.pageIndex = 0;
    });
    fromEvent(this.input.nativeElement,'keyup')
        .pipe(
            debounceTime(150),
            distinctUntilChanged(),
            tap(() => {
                this.paginator.pageIndex = 0;

                this.loadStudentsPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadStudentsPage())
    )
    .subscribe();
  }

  loadStudentsPage() {
    if (this.data.identifier.includes('session')) {
      this.dataSource.loadClassSessionStudents(
        this.currentUserId,
        this.data.searchId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
    } else {
      this.dataSource.loadCourseScheduleStudents(
        this.data.searchId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
    }
  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadStudentsPage();
    } else {
      this.clearInput();
    }
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadStudentsPage();
  }

  ok() {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.pageDetailSubscription) {
      this.pageDetailSubscription.unsubscribe();
    }
    if (this.departmentIdSubscription) {
      this.departmentIdSubscription.unsubscribe();
    }
    if (this.classSessionSubscription) {
      this.classSessionSubscription.unsubscribe();
    }
    if (this.courseScheduleSubscription) {
      this.courseScheduleSubscription.unsubscribe();
    }
  }

}