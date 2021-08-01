import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, OnChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CourseService } from '../course.service';
import { CoursesDataSource } from '../courses.datasource';
import {debounceTime, distinctUntilChanged, tap, first, switchMap} from 'rxjs/operators';
import {merge, fromEvent, Subscription } from "rxjs";
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from 'src/app/departments/department.service';
import { Department } from 'src/app/departments/department.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { PageDetail } from '../pageDetail.model';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit, AfterViewInit, OnDestroy {

  selectDepartmentForm!: FormGroup;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');
  isLoading: boolean = false;
  submitted: boolean = false;
  dataSource!: CoursesDataSource;
  departments!: Department[];
  selectedDepartmentId: number = 0;

  currentColumnDef: string = 'id';
  totalItems: number = 0;
  currentPageItems: number = 0;
  currentPage: number = 0;
  currentState: string = '';

  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  departmentsSubscription!: Subscription;

  displayedColumns = [
    'id',
    'name',
    'semester'
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
    private departmentService: DepartmentService) {}


  ngOnInit(): void {
    this.departmentService.getAllDepartments()
      .pipe(first())
      .subscribe(departments => {
        this.departments = departments;
      });
    this.selectDepartmentForm = this.formBuilder.group({
      departmentId: [0, Validators.required],
      hideRequired: this.hideRequiredControl,
      floatLabel: this.floatLabelControl
    });

    this.dataSource = new CoursesDataSource(this.courseService);

    this.dataSource.loadCourses(this.selectDepartmentForm.value.departmentId, '', 0, 3, 'asc', this.currentColumnDef);

    this.pageDetailSubscription = this.dataSource.pageDetailState.pipe(
      switchMap(async (pageDetail: PageDetail) => {
        this.totalItems = pageDetail.totalItems;
        this.currentPageItems = pageDetail.currentPageItems;
        this.currentPage = pageDetail.currentPage;
        //console.log("Entered to SwitchMap");
        if(this.currentState.includes('added')) {
          //console.log("I am inside switchmap added state");
            this.paginator.pageIndex = pageDetail.totalPages - 1;
            this.refreshTable();
            this.currentState = '';
        }
      })
    ).subscribe();
    
    this.snackbarSubscription = this.snackbarService.snackbarState.subscribe(
      (state: SnackbarData) => {
        this.currentState = state.message;
        if(this.currentState.includes('added')) {
          //console.log('Current State: '+this.currentState);
          this.paginator.pageIndex = 0;
          this.refreshTable();
        } else if(this.currentState.includes('deleted') && this.currentPageItems === 1) {
          //console.log("I am inside Deleted state");
          //console.log("CURRENT PAGE: "+this.currentPage);
          this.paginator.pageIndex = this.currentPage - 1;
          this.refreshTable();
          this.currentState = '';
        } else if(this.currentState.includes('updated')) {
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
    this.router.navigate(['/courses'], { relativeTo: this.route });
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

    if (this.input.nativeElement.value === '') {
      this.loadCoursesPage();
    } else {
      this.refreshTable();
    }
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => {
      this.currentColumnDef = this.sort.active;
      console.log("SORT ACTIVE: "+this.sort.active);
    //console.log("Sort changed "+this.sort.direction);
      this.paginator.pageIndex = 0});
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
        this.selectedDepartmentId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }
  
  refreshTable() {
    this.input.nativeElement.value='';
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    this.loadCoursesPage();
  }

  ngOnDestroy(): void {
    this.departmentsSubscription.unsubscribe();
    this.pageDetailSubscription.unsubscribe();
    this.snackbarSubscription.unsubscribe();
  }

}