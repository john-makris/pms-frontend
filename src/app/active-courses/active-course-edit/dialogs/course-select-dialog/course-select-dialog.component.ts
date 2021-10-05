import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, Inject, ViewChildren, QueryList } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {debounceTime, distinctUntilChanged, tap, switchMap} from 'rxjs/operators';
import {merge, fromEvent, Subscription } from "rxjs";
import { CoursesDataSource } from 'src/app/courses/common/tableDataHelper/courses.datasource';
import { CourseService } from 'src/app/courses/course.service';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckbox } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { Course } from 'src/app/courses/course.model';
import { DepartmentService } from 'src/app/departments/department.service';

@Component({
  selector: 'app-course-select-dialog',
  templateUrl: './course-select-dialog.component.html',
  styleUrls: ['./course-select-dialog.component.css']
})
export class CourseSelectDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  
  dialogStarted: boolean = true;
  dataSource!: CoursesDataSource;

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';

  currentDepartmentId: number =0;
  selectedRowId: number = -1;
  isRowSelected: boolean = false;
  selectedCourse!: Course | null;

  departmentIdSubscription!: Subscription;
  pageDetailSubscription!: Subscription;

  displayedColumns = [
    'id',
    'name'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;
  @ViewChild(MatCheckbox) checkbox!: MatCheckbox;

  @ViewChildren(MatCheckbox) checkboxes!: QueryList<MatCheckbox>;

  selection = new SelectionModel<Course>(false, []);

  constructor(
    private departmentService: DepartmentService,
    private courseService: CourseService,
    private dialogRef: MatDialogRef<CourseSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data :Course) {}


  ngOnInit(): void {

    this.departmentIdSubscription = this.departmentService.departmentIdState
      .subscribe((departmentId: number) => {
        this.currentDepartmentId = departmentId;
    })

    this.dataSource = new CoursesDataSource(this.courseService);

    this.dataSource.loadCourses(this.currentDepartmentId, '', 0, 3, 'asc', this.currentColumnDef);

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

                this.loadCoursesPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadCoursesPage())
    )
    .subscribe();
  }

  loadCoursesPage() {
    this.dataSource.loadCourses(
        this.currentDepartmentId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadCoursesPage();
    } else {
      this.clearInput();
    }
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadCoursesPage();
  }

  selectRow(selectedRow: Course) {
    if (selectedRow.id == this.selectedRowId) {
      this.selection.deselect(selectedRow);
      this.selectedCourse = null;
    } else {
      this.selection.toggle(selectedRow);
    }
    if(this.selection.isSelected(selectedRow)) {
      this.isRowSelected = true;
      this.selectedRowId = selectedRow.id;
      this.selectedCourse = selectedRow;
      console.log("Selected Row Id: "+ this.selectedRowId);
    } else {
      this.isRowSelected = false;
      this.selectedRowId = -1;
    }
  }

  ok() {
    this.dialogRef.close(this.selectedCourse);
  }

  close() {
      if (this.data.id) {
        console.log("Close dialog: "+this.data.name);
        this.dialogRef.close(this.data);
      } else {
        this.dialogRef.close(null);
      }
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
