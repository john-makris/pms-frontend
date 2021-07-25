import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CourseService } from '../course.service';
import { CoursesDataSource } from '../courses.datasource';
import {debounceTime, distinctUntilChanged, startWith, tap, delay, first} from 'rxjs/operators';
import {merge, fromEvent} from "rxjs";
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from 'src/app/departments/department.service';
import { Department } from 'src/app/departments/department.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit, AfterViewInit {

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
    private departmentService: DepartmentService) {

}
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
    this.dataSource = new CoursesDataSource(this.courseService, this.snackbarService);

    this.dataSource.loadCourses(this.selectDepartmentForm.value.departmentId, '', 0, 3, 'asc','id');

    this.dataSource.totalItemsState.subscribe(
      totalItems => {
        this.totalItems = totalItems;
      }
    );

  }

  get f() { return this.selectDepartmentForm.controls; }

  onSubmit() {
    this.router.navigate(['/courses'], { relativeTo: this.route });
    this.submitted = true;
    console.log("HAAAAALOOOO!!!");
    if(this.selectDepartmentForm.invalid) {
      return;
    }

    this.isLoading = true;
    console.log("DEPARTMENT ID: "+ this.selectDepartmentForm.value.departmentId);
    this.selectedDepartmentId = this.selectDepartmentForm.value.departmentId;
    this.dataSource.loadCourses(this.selectedDepartmentId, '', 0, 3, 'asc','id');
  }

  ngAfterViewInit() {

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
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

}