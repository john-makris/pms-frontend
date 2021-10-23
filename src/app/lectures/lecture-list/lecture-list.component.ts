import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, switchMap, tap } from 'rxjs/operators';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { School } from 'src/app/schools/school.model';
import { SchoolService } from 'src/app/schools/school.service';
import { LecturesDataSource } from '../common/tableDataHelper/lectures.datasource';
import { LectureService } from '../lecture.service';

@Component({
  selector: 'app-lecture-list',
  templateUrl: './lecture-list.component.html',
  styleUrls: ['./lecture-list.component.css']
})
export class LectureListComponent implements OnInit, AfterViewInit, OnDestroy {

  selectCourseSchedule!: FormGroup;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  isLoading: boolean = false;
  submitted: boolean = false;
  
  dataSource!: LecturesDataSource;
  coursesSchedules!: CourseSchedule[];
  selectedCourseScheduleId: string = '';

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';
  currentActivityState: string = '';

  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  coursesSchedulesSubscription!: Subscription;

  displayedColumns = [
    'id',
    'title'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private lectureService: LectureService,
    private snackbarService: SnackbarService,
    private courseScheduleService: CourseScheduleService) {}


  ngOnInit(): void {
    this.coursesSchedulesSubscription = this.courseScheduleService.getAllCoursesSchedules()
      .pipe(first())
      .subscribe(coursesSchedules => {
        this.coursesSchedules = coursesSchedules;
      });
    this.selectCourseSchedule = this.formBuilder.group({
      courseScheduleId: [this.selectedCourseScheduleId],
      hideRequired: this.hideRequiredControl,
      floatLabel: this.floatLabelControl
    });

    console.log("Course Schedule ID: "+this.selectedCourseScheduleId);

    this.courseScheduleService.courseScheduleIdSubject.next(+this.selectedCourseScheduleId);

    this.dataSource = new LecturesDataSource(this.lectureService);

    this.dataSource.loadLectures(this.selectCourseSchedule.value.courseScheduleId, '', 0, 3, 'asc', this.currentColumnDef);

    this.pageDetailSubscription = this.dataSource.pageDetailState.pipe(
      switchMap(async (pageDetail: PageDetail) => {
        this.totalItems = pageDetail.totalItems;
        this.currentPageItems = pageDetail.currentPageItems;
        this.currentPage = pageDetail.currentPage;
        //console.log("Entered to SwitchMap");
        if(this.currentActivityState.includes('added')) {
          //console.log("I am inside switchmap added state");
            this.paginator.pageIndex = pageDetail.totalPages - 1;
            this.refreshTable();
            this.currentActivityState = '';
        }
      })
    ).subscribe();
    
    this.snackbarSubscription = this.snackbarService.snackbarState.subscribe(
      (state: SnackbarData) => {
        this.currentActivityState = state.message;
        if(this.currentActivityState.includes('added')) {
          //console.log('Current State: '+this.currentState);
          this.selectCourseSchedule.setValue(
            {
              courseScheduleId: this.selectedCourseScheduleId,
              hideRequired: this.hideRequiredControl,
              floatLabel: this.floatLabelControl
            });
          this.selectedCourseScheduleId = this.selectCourseSchedule.value.courseScheduleId;
          this.paginator.pageIndex = 0;
          this.refreshTable();
        } else if(this.currentActivityState.includes('deleted') && this.currentPageItems === 1) {
          //console.log("I am inside Deleted state");
          //console.log("CURRENT PAGE: "+this.currentPage);
          this.paginator.pageIndex = this.currentPage - 1;
          this.refreshTable();
          this.currentActivityState = '';
        } else if(this.currentActivityState.includes('updated')) {
          this.paginator.pageIndex = this.currentPage;
          this.refreshTable();
        } else {
          this.refreshTable();
        }
      }
    );
  }

  get f() { return this.selectCourseSchedule.controls; }

  onSubmit() {
    this.router.navigate(['/lectures'], { relativeTo: this.route });
    this.submitted = true;
    //console.log("HAAAAALOOOO!!!");
    if(this.selectCourseSchedule.invalid) {
      return;
    }

    this.isLoading = true;
    //console.log("DEPARTMENT ID: "+ this.selectDepartmentForm.value.departmentId);
    this.selectedCourseScheduleId = this.selectCourseSchedule.value.courseScheduleId;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize;
    this.sort.direction='asc'
    this.currentColumnDef;
    console.log("Course Schedule ID: "+this.selectedCourseScheduleId);
    this.courseScheduleService.courseScheduleIdSubject.next(+this.selectedCourseScheduleId);

    this.refreshTable();
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

                this.loadLecturesPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadLecturesPage())
    )
    .subscribe();
  }

  loadLecturesPage() {
    this.dataSource.loadLectures(
        +this.selectedCourseScheduleId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadLecturesPage();
    } else {
      this.clearInput();
    }
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadLecturesPage();
  }

  ngOnDestroy(): void {
    this.coursesSchedulesSubscription.unsubscribe();
    this.pageDetailSubscription.unsubscribe();
    this.snackbarSubscription.unsubscribe();
 }
 
}