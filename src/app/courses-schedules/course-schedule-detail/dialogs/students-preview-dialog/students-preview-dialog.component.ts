import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { TeachersSelectDialogComponent } from 'src/app/courses-schedules/course-schedule-edit/dialogs/teachers-select-dialog/teachers-select-dialog.component';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { UserData } from 'src/app/users/common/payload/response/userData.interface';
import { UsersDataSource } from 'src/app/users/common/tableDataHelper/users.datasource';
import { UserService } from 'src/app/users/user.service';

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
    private dialogRef: MatDialogRef<TeachersSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data :{activeCourseId: number}) {}


  ngOnInit(): void {

    this.dataSource = new UsersDataSource(this.userService);

    console.log("Active Course ID: "+JSON.stringify(this.data.activeCourseId));
    this.dataSource.loadCourseScheduleStudents(this.data.activeCourseId,'', 0, 3, 'asc', this.currentColumnDef);

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
    this.dataSource.loadCourseScheduleStudents(
        this.data.activeCourseId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
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
  }

}