import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, switchMap, tap } from 'rxjs/operators';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Course } from 'src/app/courses/course.model';
import { CourseService } from 'src/app/courses/course.service';
import { ActiveCourseService } from '../active-course.service';
import { ActiveCoursesDataSource } from '../common/tableDataHelper/activeCourses.datasource';

@Component({
  selector: 'app-active-course-list',
  templateUrl: './active-course-list.component.html',
  styleUrls: ['./active-course-list.component.css']
})
export class ActiveCourseListComponent implements OnInit, AfterViewInit, OnDestroy {

  selectCourseForm!: FormGroup;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  isLoading: boolean = false;
  submitted: boolean = false;
  
  dataSource!: ActiveCoursesDataSource;
  courses!: Course[];
  selectedCourseId: number = 0;

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';
  currentActivityState: string = '';

  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  coursesSubscription!: Subscription;
  courseIdSubscription!: Subscription;

  displayedColumns = [
    'id',
    'maxLabs',
    'maxTheories',
    'status'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private courseService: CourseService,
    private snackbarService: SnackbarService,
    private activeCourseService: ActiveCourseService) {}


  ngOnInit(): void {
    this.coursesSubscription = this.courseService.getAllCourses()
      .pipe(first())
      .subscribe(courses => {
        this.courses = courses;
      });
    this.selectCourseForm = this.formBuilder.group({
      courseId: [this.selectedCourseId, Validators.required],
      hideRequired: this.hideRequiredControl,
      floatLabel: this.floatLabelControl
    });

    console.log("COURSE ID: "+this.selectedCourseId);

    this.activeCourseService.courseIdSubject.next(this.selectedCourseId);

    this.dataSource = new ActiveCoursesDataSource(this.activeCourseService);

    this.dataSource.loadActiveCourses(this.selectCourseForm.value.courseId, '', 0, 3, 'asc', this.currentColumnDef);

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
          this.selectCourseForm.setValue(
            {
              courseId: this.selectedCourseId,
              hideRequired: this.hideRequiredControl,
              floatLabel: this.floatLabelControl
            });
          this.selectedCourseId = this.selectCourseForm.value.courseId;
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

  get f() { return this.selectCourseForm.controls; }

  onSubmit() {
    this.router.navigate(['/active-courses'], { relativeTo: this.route });
    this.submitted = true;
    //console.log("HAAAAALOOOO!!!");
    if(this.selectCourseForm.invalid) {
      return;
    }

    this.isLoading = true;
    //console.log("COURSE ID: "+ this.selectDepartmentForm.value.courseId);
    this.selectedCourseId = this.selectCourseForm.value.courseId;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize;
    this.sort.direction='asc'
    this.currentColumnDef;
    console.log("COURSE ID: "+this.selectedCourseId);
    this.activeCourseService.courseIdSubject.next(this.selectedCourseId);


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

                this.loadActiveCoursesPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadActiveCoursesPage())
    )
    .subscribe();
  }

  loadActiveCoursesPage() {
    this.dataSource.loadActiveCourses(
        this.selectedCourseId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadActiveCoursesPage();
    } else {
      this.clearInput();
    }
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadActiveCoursesPage();
  }

  ngOnDestroy(): void {
    this.coursesSubscription.unsubscribe();
    this.pageDetailSubscription.unsubscribe();
    this.snackbarSubscription.unsubscribe();
  }

}