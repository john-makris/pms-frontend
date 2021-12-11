import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { CoursesSchedulesDataSource } from 'src/app/courses-schedules/common/tableDataHelper/coursesSchedules.datasource';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { DepartmentService } from 'src/app/departments/department.service';

@Component({
  selector: 'app-course-schedule-select',
  templateUrl: './course-schedule-select.component.html',
  styleUrls: ['./course-schedule-select.component.css']
})
export class CourseScheduleSelectDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  
  dialogStarted: boolean = true;
  dataSource!: CoursesSchedulesDataSource;

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';

  currentDepartmentId: number = 0;
  selectedRowId: number = -1;
  isRowSelected: boolean = false;
  selectedCourseSchedule!: CourseSchedule | null;

  departmentIdSubscription!: Subscription;
  pageDetailSubscription!: Subscription;

  displayedColumns = [
    'id',
    'name',
    'semester'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  selection = new SelectionModel<CourseSchedule>(false, []);

  constructor(
    private departmentService: DepartmentService,
    private courseScheduleService: CourseScheduleService,
    private dialogRef: MatDialogRef<CourseScheduleSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data :CourseSchedule) {}


  ngOnInit(): void {

    this.departmentIdSubscription = this.departmentService.departmentIdState
      .subscribe((departmentId: number) => {
        this.currentDepartmentId = departmentId;
    });

    this.dataSource = new CoursesSchedulesDataSource(this.courseScheduleService);

    this.dataSource.loadCoursesSchedules(this.currentDepartmentId, '', '', 0, 3, 'asc', this.currentColumnDef);

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

                this.loadCoursesSchedulesPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadCoursesSchedulesPage())
    )
    .subscribe();
  }

  loadCoursesSchedulesPage() {
    this.dataSource.loadCoursesSchedules(
        this.currentDepartmentId,
        '',
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadCoursesSchedulesPage();
    } else {
      this.clearInput();
    }
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadCoursesSchedulesPage();
  }

  selectRow(selectedRow: any) {
    //console.log("Selected Row: "+ JSON.stringify(selectedRow));
    if (selectedRow.id == this.selectedRowId) {
      this.selection.deselect(selectedRow);
      this.selectedCourseSchedule = null;
    } else {
      this.selection.toggle(selectedRow);
    }
    if(this.selection.isSelected(selectedRow)) {
      this.isRowSelected = true;
      this.selectedRowId = selectedRow.id;
      this.selectedCourseSchedule = {
        id: selectedRow.id,
        academicYear: selectedRow.academicYear,
        maxTheoryLectures: selectedRow.maxTheoryLectures,
        maxLabLectures: selectedRow.maxLabLectures,
        theoryLectureDuration: selectedRow.theoryLectureDuration,
        labLectureDuration: selectedRow.labLectureDuration,
        status: selectedRow.status,
        teachingStuff: selectedRow.teachingStuff,
        students: selectedRow.students,
        course: selectedRow.course
      }
      //console.log("Selected Course Schedule: "+JSON.stringify(this.selectedCourseSchedule));
    } else {
      this.isRowSelected = false;
      this.selectedRowId = -1;
    }
  }

  ok() {
    //console.log("DIALOG: "+JSON.stringify(this.selectedCourseSchedule));
    this.dialogRef.close(this.selectedCourseSchedule);
  }

  close() {
      if (this.data.id) {
        //console.log("Close dialog: "+this.data.name);
        //console.log("DIALOG: "+JSON.stringify(this.data));
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