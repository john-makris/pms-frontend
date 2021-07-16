import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CourseService } from '../course.service';
import { CoursesDataSource } from '../courses.datasource';
import {debounceTime, distinctUntilChanged, startWith, tap, delay} from 'rxjs/operators';
import {merge, fromEvent} from "rxjs";
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit, AfterViewInit {

  dataSource!: CoursesDataSource;

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

  constructor(private courseService: CourseService,
    private snackbarService: SnackbarService) {

}
  ngOnInit(): void {
    this.dataSource = new CoursesDataSource(this.courseService, this.snackbarService);

    this.dataSource.loadCourses('', 0, 3, 'asc','id');

    this.dataSource.totalItemsState.subscribe(
      totalItems => {
        this.totalItems = totalItems;
      }
    );
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
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }

}