import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, switchMap, tap } from 'rxjs/operators';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Department } from 'src/app/departments/department.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { ActiveCourseService } from '../active-course.service';
import { ActiveCoursesDataSource } from '../common/tableDataHelper/activeCourses.datasource';

@Component({
  selector: 'app-active-course-list',
  templateUrl: './active-course-list.component.html',
  styleUrls: ['./active-course-list.component.css']
})
export class ActiveCourseListComponent implements OnInit, AfterViewInit, OnDestroy {

  selectDepartmentForm!: FormGroup;
  isLoading: boolean = false;
  submitted: boolean = false;
  
  dataSource!: ActiveCoursesDataSource;
  departments!: Department[];
  selectedDepartmentId: number = 0;

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';
  currentActivityState: string = '';

  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  departmentsSubscription!: Subscription;

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
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private snackbarService: SnackbarService,
    private departmentService: DepartmentService,
    private activeCourseService: ActiveCourseService) {}


  ngOnInit(): void {
    this.departmentsSubscription = this.departmentService.getAllDepartments()
    .pipe(first())
    .subscribe(departments => {
      this.departments = departments;
    });
    this.selectDepartmentForm = this.formBuilder.group({
      departmentId: [this.selectedDepartmentId, Validators.required]
    });

    console.log("DEPARTMENT ID: "+this.selectedDepartmentId);

    this.departmentService.departmentIdSubject.next(this.selectedDepartmentId);

    this.dataSource = new ActiveCoursesDataSource(this.activeCourseService);

    this.dataSource.loadActiveCourses(this.selectDepartmentForm.value.departmentId, 
      '', 0, 3, 'asc', this.currentColumnDef);

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
          this.selectDepartmentForm.setValue(
            {
              departmentId: this.selectedDepartmentId
            });
          this.selectedDepartmentId = this.selectDepartmentForm.value.departmentId;
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

  get f() { return this.selectDepartmentForm.controls; }

  onSubmit() {
    this.router.navigate(['/active-courses'], { relativeTo: this.route });
    this.submitted = true;
    //console.log("HAAAAALOOOO!!!");
    if(this.selectDepartmentForm.invalid) {
      return;
    }

    this.isLoading = true;
    //console.log("DEPARTMENT ID: "+ this.selectDepartmentForm.value.departmentId);
    this.selectedDepartmentId = this.selectDepartmentForm.value.departmentId;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize;
    this.sort.direction='asc'
    this.currentColumnDef;
    console.log("DEPARTMENT ID: "+this.selectedDepartmentId);
    this.departmentService.departmentIdSubject.next(this.selectedDepartmentId);


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
        this.selectedDepartmentId,
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
    this.departmentsSubscription.unsubscribe();
    this.pageDetailSubscription.unsubscribe();
    this.snackbarSubscription.unsubscribe();
  }

}