import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Department } from '../department.model';
import { DepartmentService } from '../department.service';
import { SchoolsDepartment } from '../schools-department.model';
import { SchoolsDepartmentService } from '../schools-department.service';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css']
})
export class DepartmentListComponent implements OnInit {
  displayedColumns = [
    'id',
    'name',
    'school'
  ];
  dataSource = new MatTableDataSource<SchoolsDepartment>();
  private departmentsSnackbarSubscription!: Subscription;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private schoolsDepartmentService: SchoolsDepartmentService,
    private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    if(this.dataSource.data.length === 0) {
      console.log("Departments list is empty");
      this.schoolsDepartmentService.getAllSchoolsDepartments()
      .pipe(first())
      .subscribe(schoolsDepartments => {
        this.checkData(schoolsDepartments);
      });
    }
    this.departmentsSnackbarSubscription = this.snackbarService.snackbarState.subscribe(
      (state: SnackbarData) => {
        if(state.message.search('added' || 'updated' || 'deleted')) {
          console.log("Snackbar: " + state.message);
          this.schoolsDepartmentService.getAllSchoolsDepartments()
          .pipe(first())
          .subscribe(schoolsDepartments => {
            this.checkData(schoolsDepartments);
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
    console.log("Hallo from the Department doFilter: " + filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.log("Department filter value: "+this.dataSource.filter);
    console.log("Department value after filtering"+this.dataSource.data);
  }

  ngOnDestroy() {
    if (this.departmentsSnackbarSubscription) {
      this.departmentsSnackbarSubscription.unsubscribe();
    }
  }

  checkData(departments: SchoolsDepartment[]) {
    if(departments===null) {
      this.dataSource.data = [];
      console.log(this.dataSource.data);
    } else {
      this.dataSource.data = departments;
    }
  }

}
