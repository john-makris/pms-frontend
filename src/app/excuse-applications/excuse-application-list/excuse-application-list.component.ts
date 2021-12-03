import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatRadioButton } from '@angular/material/radio';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { Department } from 'src/app/departments/department.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { CourseScheduleSelectDialogService } from 'src/app/lectures/lecture-edit/services/course-schedule-select-dialog.sevice';
import { LectureType } from 'src/app/lectures/lecture-types/lecture-type.model';
import { LectureTypeService } from 'src/app/lectures/lecture-types/lecture-type.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { ExcuseApplicationsDataSource } from '../common/tableDataHelper/excuse-applications.datasource';
import { ExcuseApplicationService } from '../excuse-application.service';

@Component({
  selector: 'app-excuse-application-list',
  templateUrl: './excuse-application-list.component.html',
  styleUrls: ['./excuse-application-list.component.css']
})
export class ExcuseApplicationListComponent implements  OnInit, OnDestroy {
  searchExcuseApplicationForm!: FormGroup;

  currentUser: AuthUser | null = null;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  isLoading: boolean = false;
  submitted: boolean = false;
  ensureDialogStatus!: boolean;
  
  dataSource!: ExcuseApplicationsDataSource;
  departments!: Department[];
  selectedDepartmentId: string = '';
  selectedCourseScheduleId: string = '';
  selectedCourseSchedule: CourseSchedule | null = null;
  selectedLectureTypeName: string = '';
  lectureTypes: LectureType[] = [];

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';
  currentActivityState: string = '';

  courseScheduleFormControlChangedSubscription!: Subscription;
  departmentFormControlChangedSubscription!: Subscription;
  ensureDialogSubscription!: Subscription;
  courseScheduleSelectDialogSubscription!: Subscription;
  lectureTypeSubscription!: Subscription;
  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  departmentsSubscription!: Subscription;

  displayedColumns = [
    'id',
    'student',
    'course',
    'lecture'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatRadioButton) radioButton!: MatRadioButton;
  @ViewChild('input') input!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private excuseApplicationService: ExcuseApplicationService,
    private lectureTypeService: LectureTypeService,
    private courseScheduleService: CourseScheduleService,
    private courseScheduleSelectDialogService: CourseScheduleSelectDialogService,
    private snackbarService: SnackbarService,
    private departmentService: DepartmentService,
    private authService: AuthService) {}

  ngOnInit(): void {

    this.searchExcuseApplicationForm = this.formBuilder.group({
      departmentId: [this.selectedDepartmentId],
      courseSchedule: [null],
      selectedLectureTypeName : [this.selectedLectureTypeName]
    });

    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.showAdminFeatures = this.currentUser.roles.includes('ADMIN');
        this.showTeacherFeatures = this.currentUser.roles.includes('TEACHER');
        this.showStudentFeatures = false;
        // this.currentUser.roles.includes('STUDENT');

        if (this.showStudentFeatures) {
          this.displayedColumns = [];
          this.displayedColumns = ['name', 'startTime', 'capacity', 'subscription'];
          //this.selectedDepartmentId = '1'; //this.currentUser.department.id.toString();
        }
      }
    });

    this.lectureTypeSubscription = this.lectureTypeService.getAllLectureTypes()
    .pipe(first())
    .subscribe(lectureTypes => {
      this.lectureTypes = lectureTypes;
      console.log(this.lectureTypes);
    });

    if (!this.showStudentFeatures) {
      this.departmentsSubscription = this.departmentService.getAllDepartments()
      .pipe(first())
      .subscribe(departments => {
        this.departments = departments;
      });
    }

    console.log("DEPARTMENT ID: "+this.selectedDepartmentId);

    this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);

    this.dataSource = new ExcuseApplicationsDataSource(this.excuseApplicationService);

    if (+this.searchExcuseApplicationForm.value.departmentId) {
      this.dataSource.loadDepartmentExcuseApplications(
        +this.selectedDepartmentId, +this.selectedCourseScheduleId, this.selectedLectureTypeName, '', 0, 3, 'asc', this.currentColumnDef);
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
          console.log("Selected Department Id: "+this.selectedDepartmentId);
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

    this.courseScheduleSelectDialogSubscription = this.courseScheduleSelectDialogService.courseScheduleSelectDialogState
    .subscribe((_courseSchedule: CourseSchedule | null) => {
      console.log("Course Schedule Data: "+JSON.stringify(_courseSchedule));
      if (_courseSchedule !== null) {
        console.log("CATCH COURSE SCHEDULE: "+_courseSchedule.course.name);
        this.searchExcuseApplicationForm.patchValue({
          courseSchedule: _courseSchedule
        });
        this.selectedCourseSchedule = _courseSchedule;
        this.selectedCourseScheduleId = _courseSchedule.id.toString();
        this.searchExcuseApplicationForm.patchValue({
          isLectureTypeNameTheory: true
        });
        this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
        this.onSubmit();
      }
    });

    this.departmentFormControlChangedSubscription = this.searchExcuseApplicationForm.controls.departmentId.valueChanges.subscribe(() => {
      console.log("Changed Department's value !");
      this.checkForCourseScheduleValue();
    });

    this.courseScheduleFormControlChangedSubscription = this.searchExcuseApplicationForm.controls.courseSchedule.valueChanges
    .subscribe((courseSchedule: CourseSchedule) => {
      console.log("Changed CourseSchedule's value !");
      if (courseSchedule) {
        this.displayedColumns = ['id', 'student', 'lecture'];
      } else {
        this.displayedColumns = ['id', 'student', 'course', 'lecture'];
      }
    });
  }

  get df() { return this.searchExcuseApplicationForm.controls; }

  onSubmit() {
    this.router.navigate(['/excuse-applications'], { relativeTo: this.route });
    this.submitted = true;
    //console.log("HAAAAALOOOO!!!");
    if(this.searchExcuseApplicationForm.invalid) {
      return;
    }

    this.isLoading = true;
    //console.log("Course Schedule ID: "+ this.selectCourseScheduleForm.value.courseSchedule.id);

    this.paginator.pageIndex = 0;
    this.sort.direction='asc'

    this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);

    // console.log("Selected value: "+this.selectDepartmentForm.value.isLectureTypeNameTheory);
    // this.selectedLectureTypeModerator();
    // console.log("Selected lecture type: "+this.selectedLectureTypeName);
    //this.publishLectureType();

    this.refreshTable();
  }

  selectCourseSchedule() {
    this.courseScheduleSelectDialogService.selectCourseSchedule(this.searchExcuseApplicationForm.value.courseSchedule);
  }

  checkForCourseScheduleValue() {
    if (this.searchExcuseApplicationForm.value.courseSchedule) {
      this.clearCourseScheduleValue();
    }
  }

  clearCourseScheduleValue() {
    this.searchExcuseApplicationForm.patchValue({
      courseSchedule: '',
      selectedLectureTypeName: ''
    });
    this.selectedCourseSchedule = null;
    this.selectedCourseScheduleId = '';
    this.selectedLectureTypeName = '';
    this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
    this.router.navigate(['/excuse-applications'], { relativeTo: this.route});
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

                this.loadExcuseApplicationsPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadExcuseApplicationsPage())
    )
    .subscribe();
  }

  loadExcuseApplicationsPage() {
    this.dataSource.loadDepartmentExcuseApplications(
        +this.selectedDepartmentId,
        +this.selectedCourseScheduleId,
        this.selectedLectureTypeName,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadExcuseApplicationsPage();
    } else {
      this.clearInput();
    }
    this.excuseApplicationService.excuseApplicationTableLoadedSubject.next(true);
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadExcuseApplicationsPage();
  }

  ngOnDestroy(): void {
    if (this.ensureDialogSubscription) {
      this.ensureDialogSubscription.unsubscribe();
    }

    if (this.snackbarSubscription) {
      this.snackbarSubscription.unsubscribe();
    }

    if (this.pageDetailSubscription) {
      this.pageDetailSubscription.unsubscribe();
    }

    if (this.departmentsSubscription) {
      this.departmentsSubscription.unsubscribe();
    }

    if (this.courseScheduleSelectDialogSubscription) {
      this.courseScheduleSelectDialogSubscription.unsubscribe();
    }

    if (this.lectureTypeSubscription) {
      this.lectureTypeSubscription.unsubscribe();
    }

    if (this.departmentFormControlChangedSubscription) {
      this.departmentFormControlChangedSubscription.unsubscribe();
    }

  }

}