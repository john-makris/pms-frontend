import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { AuthUser } from 'src/app/users/auth-user.model';
import { UserResponseData } from 'src/app/users/common/payload/response/userResponseData.interface';
import { UsersDataSource } from 'src/app/users/common/tableDataHelper/users.datasource';
import { UserService } from 'src/app/users/user.service';

@Component({
  selector: 'app-student-select-dialog',
  templateUrl: './student-select-dialog.component.html',
  styleUrls: ['./student-select-dialog.component.css']
})
export class StudentSelectDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  
  dialogStarted: boolean = true;
  dataSource!: UsersDataSource;

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  currentNameIdentifier: string = '';

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';

  selectedRowId: number = -1;
  isRowSelected: boolean = false;
  selectedStudent!: UserResponseData | null;

  departmentId: number = 0;
  currentClassGroupTypeId: number = 0;

  currentClassSessionId: number = 0;

  pageDetailSubscription!: Subscription;

  displayedColumns = [
    'username',
    'firstname',
    'lastname'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  selection = new SelectionModel<UserResponseData>(false, []);

  constructor(
    private userService: UserService,
    private dialogRef: MatDialogRef<StudentSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data :{object: any},
    private authService: AuthService) {}


  ngOnInit(): void {

    this.dataSource = new UsersDataSource(this.userService);

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

    this.currentNameIdentifier = this.data.object.nameIdentifier;

    if (this.currentNameIdentifier.includes('group')) {
      console.log("Instance of Class Group");
      this.departmentId = this.data.object.courseSchedule.id;
      console.log("Course Schedule Id: " + this.departmentId);
  
      this.currentClassGroupTypeId = this.data.object.groupType.id;
      console.log("Class Group Type Id: " + this.currentClassGroupTypeId);
  
      this.dataSource.loadStudentsWithoutGroup(this.currentUserId, this.departmentId, 
        this.currentClassGroupTypeId, '', 0, 3, 'asc', this.currentColumnDef);
    }else if (this.currentNameIdentifier.includes('session')) {
      console.log("Instance of Class Session");

      this.currentClassSessionId = this.data.object.id;
      console.log("Class Session Id: " + this.currentClassSessionId);
  
      this.dataSource.loadClassSessionStudents(this.currentClassSessionId, 
        '', 0, 3, 'asc', this.currentColumnDef);
    } else {
      console.log("Instance of Excuse Application");
      this.departmentId = this.data.object.departmentId;
      console.log("Department Id: " + this.departmentId);

      this.dataSource.loadUsers(this.departmentId, 'ROLE_STUDENT',
        '', 0, 3, 'asc', this.currentColumnDef);
    }

    this.pageDetailSubscription = this.dataSource.pageDetailState.pipe(
      switchMap(async (pageDetail: PageDetail) => {
        this.totalItems = pageDetail.totalItems;
        this.currentPageItems = pageDetail.currentPageItems;
        this.currentPage = pageDetail.currentPage;
        //console.log("Entered to SwitchMap");
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
    if (this.currentNameIdentifier.includes('group')) {
      this.dataSource.loadStudentsWithoutGroup(
        this.currentUserId,
        this.departmentId,
        this.currentClassGroupTypeId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
    } else if (this.currentNameIdentifier.includes('session')) {
      this.dataSource.loadClassSessionStudents(
        this.currentClassSessionId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
    } else {
      this.dataSource.loadUsers(
        this.departmentId,
        'ROLE_STUDENT',
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

  selectRow(selectedRow: UserResponseData) {
    //console.log("Selected Row: "+ JSON.stringify(selectedRow));
    if (selectedRow.id == this.selectedRowId) {
      this.selection.deselect(selectedRow);
      this.selectedStudent = null;
    } else {
      this.selection.toggle(selectedRow);
    }
    if(this.selection.isSelected(selectedRow)) {
      this.isRowSelected = true;
      this.selectedRowId = selectedRow.id;
      this.selectedStudent = selectedRow;
      //console.log("Selected Course Schedule: "+JSON.stringify(this.selectedClassGroup));
    } else {
      this.isRowSelected = false;
      this.selectedRowId = -1;
    }
  }

  ok() {
    //console.log("DIALOG: "+JSON.stringify(this.selectedClassGroup));
    this.dialogRef.close(this.selectedStudent);
  }

  close() {
    this.dialogRef.close(null);
  }

  ngOnDestroy(): void {
    if (this.pageDetailSubscription) {
      this.pageDetailSubscription.unsubscribe();
    }
  }
}