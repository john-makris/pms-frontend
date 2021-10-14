import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, switchMap, tap } from 'rxjs/operators';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { School } from 'src/app/schools/school.model';
import { SchoolService } from 'src/app/schools/school.service';
import { DepartmentsDataSource } from '../common/tableDataHelper/departments.datasource';
import { Department } from '../department.model';
import { DepartmentService } from '../department.service';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css']
})
export class DepartmentListComponent implements OnInit, AfterViewInit, OnDestroy {

  selectSchoolForm!: FormGroup;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  isLoading: boolean = false;
  submitted: boolean = false;
  
  dataSource!: DepartmentsDataSource;
  schools!: School[];
  selectedSchoolId: string = '';

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';
  currentActivityState: string = '';

  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  schoolsSubscription!: Subscription;

  displayedColumns = [
    'id',
    'name'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private departmentService: DepartmentService,
    private snackbarService: SnackbarService,
    private schoolService: SchoolService) {}


  ngOnInit(): void {
    this.schoolsSubscription = this.schoolService.getAllSchools()
      .pipe(first())
      .subscribe(schools => {
        this.schools = schools;
      });
    this.selectSchoolForm = this.formBuilder.group({
      schoolId: [this.selectedSchoolId],
      hideRequired: this.hideRequiredControl,
      floatLabel: this.floatLabelControl
    });

    console.log("SCHOOL ID: "+this.selectedSchoolId);

    this.schoolService.schoolIdSubject.next(+this.selectedSchoolId);

    this.dataSource = new DepartmentsDataSource(this.departmentService);

    this.dataSource.loadDepartments(this.selectSchoolForm.value.schoolId, '', 0, 3, 'asc', this.currentColumnDef);

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
          this.selectSchoolForm.setValue(
            {
              schoolId: this.selectedSchoolId,
              hideRequired: this.hideRequiredControl,
              floatLabel: this.floatLabelControl
            });
          this.selectedSchoolId = this.selectSchoolForm.value.schoolId;
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

  get f() { return this.selectSchoolForm.controls; }

  onSubmit() {
    this.router.navigate(['/departments'], { relativeTo: this.route });
    this.submitted = true;
    //console.log("HAAAAALOOOO!!!");
    if(this.selectSchoolForm.invalid) {
      return;
    }

    this.isLoading = true;
    //console.log("DEPARTMENT ID: "+ this.selectDepartmentForm.value.departmentId);
    this.selectedSchoolId = this.selectSchoolForm.value.schoolId;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize;
    this.sort.direction='asc'
    this.currentColumnDef;
    console.log("SCHOOL ID: "+this.selectedSchoolId);
    this.schoolService.schoolIdSubject.next(+this.selectedSchoolId);

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

                this.loadDepartmentsPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadDepartmentsPage())
    )
    .subscribe();
  }

  loadDepartmentsPage() {
    this.dataSource.loadDepartments(
        +this.selectedSchoolId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadDepartmentsPage();
    } else {
      this.clearInput();
    }
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadDepartmentsPage();
  }

  ngOnDestroy(): void {
    this.schoolsSubscription.unsubscribe();
    this.pageDetailSubscription.unsubscribe();
    this.snackbarSubscription.unsubscribe();
  }

}