import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-students-preview-dialog',
  templateUrl: './students-preview-dialog.component.html',
  styleUrls: ['./students-preview-dialog.component.css']
})
export class StudentsPreviewDialogComponent implements OnInit {

  dialogStarted: boolean = true;
  isLoading: boolean = false;
  submitted: boolean = false;
  
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
    @Inject(MAT_DIALOG_DATA) public data :{searchId: number}) {}


  ngOnInit(): void {

    this.dataSource = new UsersDataSource(this.userService);

    this.courseScheduleSubscription = this.courseScheduleService.courseScheduleState
    .subscribe((_courseSchedule: CourseSchedule | null) => {
      this.currentCourseSchedule = _courseSchedule;
      if (_courseSchedule && _courseSchedule.id === this.data.searchId) {
        console.log("Course Schedule ID: "+JSON.stringify(this.data.searchId));
        this.dataSource.loadCourseScheduleStudents(this.data.searchId,'', 0, 3, 'asc', this.currentColumnDef);
      }
    });

    this.classSessionSubscription = this.classSessionService.classSessionState
    .subscribe((_classSession: ClassSessionResponseData | null) => {
      this.currentClassSession = _classSession;
      if (_classSession && _classSession.id === this.data.searchId) {
        console.log("Class Session ID: "+JSON.stringify(this.data.searchId));
        this.dataSource.loadClassSessionStudents(this.data.searchId,'', 0, 3, 'asc', this.currentColumnDef);
      }
    });

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
    if (this.currentCourseSchedule) {
      this.dataSource.loadCourseScheduleStudents(
        this.data.searchId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
    }

    if (this.currentClassSession) {
      this.dataSource.loadClassSessionStudents(
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