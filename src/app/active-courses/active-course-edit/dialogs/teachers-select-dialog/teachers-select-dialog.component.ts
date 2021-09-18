import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { UserData } from 'src/app/users/common/payload/response/userData.interface';
import { UsersDataSource } from 'src/app/users/common/tableDataHelper/users.datasource';
import { UserService } from 'src/app/users/user.service';

@Component({
  selector: 'app-teachers-select-dialog',
  templateUrl: './teachers-select-dialog.component.html',
  styleUrls: ['./teachers-select-dialog.component.css']
})
export class TeachersSelectDialogComponent implements OnInit {
  
  dialogStarted: boolean = true;
  isLoading: boolean = false;
  submitted: boolean = false;
  
  dataSource!: UsersDataSource;

  haha: boolean = false;

  selectedRows: Array<UserData> = [];

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';

  pageDetailSubscription!: Subscription;

  displayedColumns = [
    'id',
    'username',
    'select'
  ];

  selection = new SelectionModel<UserData>(true, []);

  @ViewChild(MatCheckbox) checkbox!: MatCheckbox;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  constructor(
    private userService: UserService,
    private dialogRef: MatDialogRef<TeachersSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data :UserData) {}


  ngOnInit(): void {

    //console.log("DEPARTMENT ID: "+this.selectedDepartmentId);

    //this.userService.departmentIdSubject.next(this.selectedDepartmentId);

    this.dataSource = new UsersDataSource(this.userService);

    this.dataSource.loadUsers(0, 'ROLE_TEACHER','', 0, 3, 'asc', this.currentColumnDef);

    this.pageDetailSubscription = this.dataSource.pageDetailState.pipe(
      switchMap(async (pageDetail: PageDetail) => {
        this.totalItems = pageDetail.totalItems;
        this.currentPageItems = pageDetail.currentPageItems;
        this.currentPage = pageDetail.currentPage;
        console.log("Heyyyy");
      })
    ).subscribe();
  }

  simpleCheck(row: any): boolean {
    let result;
    result = this.selectedRows.find(data => row.id === data.id);
    if (result === undefined) {
      //this.selection.deselect(row);
      return false;
    } else {
      //this.selection.isSelected(row);
      //this.selection.select(row);
      //console.log(row.id);
      return true;
    }
  }

  check(row: any): boolean {
    let result;
    result = this.selectedRows.find(data => row.id === data.id);
    if (result === undefined) {
      this.selection.deselect(row);
      return false;
    } else {
      //this.selection.isSelected(row);
      this.selection.select(row);
      console.log(row.id);
      return true;
    }
  }

  selectHandler(row: UserData) {
    let result;
    console.log("WHAT?");
    this.selection.toggle(row);
    result = this.selectedRows.find(data => row.id === data.id);
    if (this.selection.isSelected(row)) {
      if(result === undefined) {
        console.log("result: "+result);
        this.selectedRows.push(row);
        console.log("New "+row.username);
        //this.check(row);
        this.haha = true;
        console.log("Data pushed! "+this.selectedRows.length);
      }
    } else {
        this.unCheck({
          userData: row,
          isSelected: true
        });
        this.haha = false;
        //this.check(row);
        console.log("Data removed! "+this.selectedRows.length);
    }
  }

  unCheck(data: any) {
    this.selectedRows.forEach(newData => {
      if (data.userData.id === newData.id) {
        console.log("Still exists ..."+data.userData.username);
      }
    });
    console.log("DELETE");
    this.selectedRows.forEach((element,index)=>{
        if(element.id === data.userData.id) this.selectedRows.splice(index,1);
    });
    this.selectedRows.forEach(newData => {
      if (data.userData.id === newData.id) {
        console.log("Still exists ..."+data.userData.username);
      }
    });
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

                this.loadUsersPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadUsersPage())
    )
    .subscribe();
  }

  loadUsersPage() {
    this.dataSource.loadUsers(
        0,
        'ROLE_TEACHER',
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadUsersPage();
    } else {
      this.clearInput();
    }
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadUsersPage();
  }

  ok() {
    this.dialogRef.close(this.selectedRows);
  }

  close() {
    if (this.data.username) {
      console.log("Close dialog: "+this.data.username);
      this.dialogRef.close(this.data);
    } else {
      this.dialogRef.close(null);
    }
  }

  ngOnDestroy(): void {
    if (this.pageDetailSubscription) {
      this.pageDetailSubscription.unsubscribe();
    }
  }

}