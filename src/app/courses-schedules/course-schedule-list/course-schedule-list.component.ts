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
import { CoursesSchedulesDataSource } from '../common/tableDataHelper/coursesSchedules.datasource';
import { CourseScheduleService } from '../course-schedule.service';

@Component({
  selector: 'app-course-schedule-list',
  templateUrl: './course-schedule-list.component.html',
  styleUrls: ['./course-schedule-list.component.css']
})
export class CourseScheduleListComponent implements OnInit, AfterViewInit, OnDestroy {

  selectDepartmentForm!: FormGroup;
  isLoading: boolean = false;
  submitted: boolean = false;
  
  dataSource!: CoursesSchedulesDataSource;
  departments!: Department[];
  selectedDepartmentId: string = '';

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';
  currentActivityState: string = '';

  selectedStatus: string  = 'Current';
  statusTypes = ['Pending', 'Current', 'Past'];

  departmentIdFormControlChangedSubscription!: Subscription;
  statusFormControlChangedSubscription!: Subscription;
  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  departmentsSubscription!: Subscription;

  displayedColumns = [
    'id',
    'name',
    'semester',
    'status'
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
    private courseScheduleService: CourseScheduleService) {}


  ngOnInit(): void {
    this.departmentsSubscription = this.departmentService.getAllDepartments()
    .pipe(first())
    .subscribe(departments => {
      this.departments = departments;
    });

    this.selectDepartmentForm = this.formBuilder.group({
      departmentId: [this.selectedDepartmentId],
      status: [this.selectedStatus]
    });

    console.log("DEPARTMENT ID: "+this.selectedDepartmentId);

    if (this.selectedDepartmentId !== null) {
      this.courseScheduleService.courseScheduleTableLoadedSubject.next(true);
    }

    this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);

    this.dataSource = new CoursesSchedulesDataSource(this.courseScheduleService);

    if (this.selectedDepartmentId === '') {
      this.dataSource.loadCoursesSchedules(this.selectDepartmentForm.value.departmentId, '',
        '', 0, 3, 'asc', this.currentColumnDef);
    } else {
      this.dataSource.loadCoursesSchedules(this.selectDepartmentForm.value.departmentId, this.selectedStatus,
        '', 0, 3, 'asc', this.currentColumnDef);
    }

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

    this.statusFormControlChangedSubscription = this.selectDepartmentForm.controls.status.valueChanges
    .subscribe((status: string) => {
      console.log("Changed Status value !");
      if (status === '') {
        this.addTableElement('status');
      } else {
        this.removeTableElement('status');
      }
    });

  }

  get f() { return this.selectDepartmentForm.controls; }

  removeTableElement(tableElement: string) {
    this.displayedColumns.forEach((element,index)=>{
        if(element===tableElement) this.displayedColumns.splice(index,1);
    });
  }

  addTableElement(tableElement: string) {
    const result = this.displayedColumns.find(element => element.match(tableElement));
    if (result === undefined) {
      this.displayedColumns.push(tableElement);
    }
  }

  onSubmit() {
    this.router.navigate(['/courses-schedules'], { relativeTo: this.route });
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
    this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);

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

                this.loadCoursesSchedulesPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadCoursesSchedulesPage())
    )
    .subscribe();
  }

  loadCoursesSchedulesPage() {
    this.checksBeforeLoading();
    this.dataSource.loadCoursesSchedules(
        +this.selectedDepartmentId,
        this.selectedStatus,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadCoursesSchedulesPage();
    } else {
      this.clearInput();
    }
    this.courseScheduleService.courseScheduleTableLoadedSubject.next(true);
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadCoursesSchedulesPage();
  }

  checksBeforeLoading() {
    if (this.selectedDepartmentId === '') {
      this.selectedStatus = '';
      this.selectDepartmentForm.patchValue({
        status: ''
      });
    }

    this.departmentIdFormControlChangedSubscription = this.selectDepartmentForm.controls.departmentId.valueChanges
    .pipe(first())
    .subscribe((departmentId: string) => {
      console.log("Changed Department Id value !");
      if (departmentId !== '') {
        this.selectedStatus = 'Current';
        this.selectDepartmentForm.patchValue({
          status: 'Current'
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.departmentsSubscription) {
      this.departmentsSubscription.unsubscribe();
    }
    if (this.pageDetailSubscription) {
      this.pageDetailSubscription.unsubscribe();
    }
    if (this.snackbarSubscription) {
      this.snackbarSubscription.unsubscribe();
    }
    if (this.statusFormControlChangedSubscription) {
      this.statusFormControlChangedSubscription.unsubscribe();
    }
  }

}