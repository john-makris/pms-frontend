import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { SnackbarData, SnackbarService } from 'src/app/shared/snackbar.service';
import { School } from '../school.model';
import { SchoolService } from '../school.service';

@Component({
  selector: 'app-school-list',
  templateUrl: './school-list.component.html',
  styleUrls: ['./school-list.component.css']
})
export class SchoolListComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns = [
    'id',
    'name',
    'location'
  ];
  dataSource = new MatTableDataSource<School>();
  private schoolsSubscription!: Subscription;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private schoolService: SchoolService,
    private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    if(!this.dataSource.data.length) {
      console.log("Schools list is empty");
      this.schoolService.getAllSchools()
      .pipe(first())
      .subscribe(schools => {
        this.dataSource.data = schools;
        console.log(this.dataSource.data);
      });
    }
    this.snackbarService.snackbarState.subscribe(
      (state: SnackbarData) => {
        if(state.message.search('added' || 'updated' || 'deleted')) {
          console.log("Snackbar: " + state.message);
          this.schoolService.getAllSchools()
          .pipe(first())
          .subscribe(schools => {
            this.dataSource.data = schools;
          });
        }
      }
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.log("School filter value: "+this.dataSource.filter);
    console.log("School value after filtering"+this.dataSource.data);
  }

  ngOnDestroy() {
    if (this.schoolsSubscription) {
      this.schoolsSubscription.unsubscribe();
    }
  }

}
