import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { ActiveCourseService } from '../active-course.service';
import { ActiveCoursesDataSource } from '../common/tableDataHelper/activeCourses.datasource';

@Component({
  selector: 'app-active-course-list',
  templateUrl: './active-course-list.component.html',
  styleUrls: ['./active-course-list.component.css']
})
export class ActiveCourseListComponent implements OnInit, AfterViewInit, OnDestroy {

  isLoading: boolean = false;
  submitted: boolean = false;
  
  dataSource!: ActiveCoursesDataSource;

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';
  currentActivityState: string = '';

  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;

  displayedColumns = [
    'id',
    'name',
    'semester',
    'academicYear'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  constructor(
    private activeCourseService: ActiveCourseService,
    private snackbarService: SnackbarService) {}


  ngOnInit(): void {

    this.dataSource = new ActiveCoursesDataSource(this.activeCourseService);

    this.dataSource.loadActiveCourses(0, '', 0, 3, 'asc', this.currentColumnDef);

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
    this.pageDetailSubscription.unsubscribe();
    this.snackbarSubscription.unsubscribe();
  }

}