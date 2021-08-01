import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {debounceTime, distinctUntilChanged, startWith, tap, delay, first} from 'rxjs/operators';
import {merge, fromEvent} from "rxjs";
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { School } from '../school.model';
import { SchoolService } from '../school.service';
import { SchoolsDataSource } from '../schools.datasource';

@Component({
  selector: 'app-school-list',
  templateUrl: './school-list.component.html',
  styleUrls: ['./school-list.component.css']
})
export class SchoolListComponent implements OnInit, AfterViewInit {

  dataSource!: SchoolsDataSource;
  currentColumnDef: string = 'id';
  totalItems!: number;

  displayedColumns = [
    'id',
    'name',
    'location'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  constructor(
    private schoolService: SchoolService,
    private snackbarService: SnackbarService) {
  }

  ngOnInit(): void {
    this.dataSource = new SchoolsDataSource(this.schoolService, this.snackbarService);
    this.dataSource.loadSchools('', 0, 3, 'asc', 'id');

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
    this.dataSource.loadSchools(
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }

}
