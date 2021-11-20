import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { ClassGroup } from 'src/app/classes-groups/class-group.model';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
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

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';

  selectedRowId: number = -1;
  isRowSelected: boolean = false;
  selectedStudent!: UserResponseData | null;

  currentCourseScheduleId: number = 0;
  currentClassGroupTypeId: number = 0;

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
    @Inject(MAT_DIALOG_DATA) public data :{classGroup: ClassGroup}) {}


  ngOnInit(): void {

    this.dataSource = new UsersDataSource(this.userService);

    this.currentCourseScheduleId = this.data.classGroup.courseSchedule.id;
    console.log("Course Schedule Id: " + this.currentCourseScheduleId);

    this.currentClassGroupTypeId = this.data.classGroup.groupType.id;
    console.log("Class Group Type Id: " + this.currentClassGroupTypeId);

    this.dataSource.loadStudentsWithoutGroup(this.currentCourseScheduleId, 
      this.currentClassGroupTypeId, '', 0, 3, 'asc', this.currentColumnDef);

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
   this.dataSource.loadStudentsWithoutGroup(
        this.currentCourseScheduleId,
        this.currentClassGroupTypeId,
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