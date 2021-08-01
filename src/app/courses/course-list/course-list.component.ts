import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, OnChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CourseService } from '../course.service';
import { CoursesDataSource } from '../courses.datasource';
import {debounceTime, distinctUntilChanged, tap, first, switchMap} from 'rxjs/operators';
import {merge, fromEvent } from "rxjs";
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from 'src/app/departments/department.service';
import { Department } from 'src/app/departments/department.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';

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
  totalItems!: number;
  totalPages!: number;
  itemsPerPage!: number;
  currentPage!: number;
  malakia: string = '';

  displayedColumns = [
    'id',
    'name',
    'semester'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;
  currentState!: SnackbarData;

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

    this.dataSource.totalItemsState.subscribe(
      totalItems => {
        this.totalItems = totalItems;
      }
    );

    this.dataSource.itemsPerPageState.subscribe(
      currentPageItems => {
        this.itemsPerPage = currentPageItems;
        //console.log("CURRENT PAGE ITEMS: "+this.itemsPerPage);
      }
    );

    this.dataSource.currentPageState.subscribe(
      (currentPage) => {
        this.currentPage = currentPage;
      }
    );


    this.dataSource.totalPagesState.pipe(
      switchMap(async (totalPages) => {
        if(this.malakia.includes('added')) {
          console.log("HALLOOOOOOOO!!!!")
            this.paginator.pageIndex = totalPages - 1;
            this.refreshTable();
            this.malakia = '';
        }
      })
    )
    .subscribe();
    
    this.snackbarService.snackbarState.subscribe(
      (state: SnackbarData) => {
        this.currentState = state;
        if(state.message.search('added' || 'updated' || 'deleted')) {
          this.malakia = state.message;
          console.log('MALAKIA: '+this.malakia);
          //this.paginator.pageIndex = 0;
          this.refreshTable();
          //console.log("TOTAL PAGES: "+this.totalPages);
          if(this.malakia.includes('deleted') && this.itemsPerPage === 1) {
            this.paginator.pageIndex = this.currentPage - 1;
            this.refreshTable();
          }
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
  }

}