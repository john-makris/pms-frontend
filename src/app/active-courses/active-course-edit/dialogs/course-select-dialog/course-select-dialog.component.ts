import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, Inject, ViewChildren, QueryList } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {debounceTime, distinctUntilChanged, tap, first, switchMap} from 'rxjs/operators';
import {merge, fromEvent, Subscription } from "rxjs";
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from 'src/app/departments/department.service';
import { Department } from 'src/app/departments/department.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { CoursesDataSource } from 'src/app/courses/common/tableDataHelper/courses.datasource';
import { CourseService } from 'src/app/courses/course.service';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { selectCourseDialogData } from '../../interfaces/selectCourseDialogData.interface';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { Course } from 'src/app/courses/course.model';

@Component({
  selector: 'app-course-select-dialog',
  templateUrl: './course-select-dialog.component.html',
  styleUrls: ['./course-select-dialog.component.css']
})
export class CourseSelectDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  
  dataSource!: CoursesDataSource;

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';

  selectedRowId: number = -1;
  isRowSelected: boolean = false;

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
    private courseService: CourseService,
    private dialogRef: MatDialogRef<CourseSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data :selectCourseDialogData) {}


  ngOnInit(): void {

    this.dataSource = new CoursesDataSource(this.courseService);

    this.dataSource.loadCourses(0, '', 0, 3, 'asc', this.currentColumnDef);

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
        0,
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
    } else {
      this.selection.toggle(selectedRow);
    }
    if(this.selection.isSelected(selectedRow)) {
      this.isRowSelected = true;
      this.selectedRowId = selectedRow.id;
      console.log("Selected Row Id: "+ this.selectedRowId);
    } else {
      this.isRowSelected = false;
      this.selectedRowId = -1;
    }
  }

  ok() {
    this.dialogRef.close(this.selectedRowId);
  }

  close() {
      this.dialogRef.close(this.data.id);
  }

  ngOnDestroy(): void {
    this.pageDetailSubscription.unsubscribe();
  }

}
