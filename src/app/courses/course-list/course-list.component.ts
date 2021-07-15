import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Course } from '../course.model';
import { CourseService } from '../course.service';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit {
  displayedColumns = [
    'id',
    'name',
    'semester',
    'department'
  ];
  dataSource = new MatTableDataSource<Course>();

  

  value!: string;
  name = '';
  page = 1;
  pageSize = 3;
  totalPages = 0;
  totalItems = 0;

  private coursesSnackbarSubscription!: Subscription;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private courseService: CourseService,
    private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    this.retrieveCourses();
  }

  getRequestParams(searchName: string, page: number, pageSize: number): any {
    let params: any = {};

    if (searchName) {
      params[`name`] = searchName;
    }
    ///// !!!!!
    if (page) {
      params[`page`] = page - 1;
    }

    if (pageSize) {
      params[`size`] = pageSize;
    }

    params[`sort`] = "id,asc";

    return params;
  }

  retrieveCourses() {
    const params = this.getRequestParams(this.name, this.page, this.pageSize);
    console.log("after: "+this.page+" "+this.pageSize);
    if(this.dataSource.data.length === 0) {
      console.log("Courses list is empty");
      this.getCourses(params);
    }
    this.coursesSnackbarSubscription = this.snackbarService.snackbarState.subscribe(
      (state: SnackbarData) => {
        if(state.message.search('added' || 'updated' || 'deleted')) {
          this.name = '';
          this.value = '';
          console.log("Snackbar: " + state.message);
          console.log("PARAMS: "+"name: "+this.name+", page: "+this.page+", size: "+this.pageSize);
          this.getCourses(params);
        }
      }
    );
  }

  getCourses(params: any) {
    this.courseService.getAllCourses(params)
    .pipe(first())
    .subscribe(response => {
      if(response !== null) {
        const { courses, totalItems, totalPages } = response;
        this.totalItems = totalItems;
        this.totalPages = totalPages;
        console.log(response);
        console.log("After response page size: "+this.pageSize);
        this.checkData(courses);
      } else {
        this.checkData([]);
      }
    });
  }

  doFilter(filterValue: string) {
    this.name = filterValue;
    this.page = 1;
    const params = this.getRequestParams(this.name, this.page, this.pageSize);
    console.log("PARAMS: "+"name: "+this.name+", page: "+this.page+", size: "+this.pageSize);
    this.getCourses(params);
  }

  onPaginateChange(event: PageEvent) {
    this.page = +event.pageIndex + 1;
    console.log(event.pageIndex);
    this.pageSize = +event.pageSize;
    console.log("HALLOOO");
    const params = this.getRequestParams(this.name, this.page, this.pageSize);
    this.getCourses(params);
  }

  ngOnDestroy() {
    if (this.coursesSnackbarSubscription) {
      this.coursesSnackbarSubscription.unsubscribe();
    }
  }

  checkData(courses: Course[]) {
    if(courses===null) {
      this.dataSource.data = [];
      console.log(this.dataSource.data);
    } else {
      this.dataSource.data = courses;
    }
  }
}