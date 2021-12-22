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
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showSecretaryFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  isLoading: boolean = false;
  submitted: boolean = false;
  ensureDialogStatus!: boolean;
  
  dataSource!: ExcuseApplicationsDataSource;
  departments!: Department[];
  lectureTypes: LectureType[] = [];

  selectedDepartmentId: string = '';
  selectedCourseScheduleId: string = '';
  selectedCourseSchedule: CourseSchedule | null = null;
  selectedLectureTypeName: string = '';

  selectedStatus: string  = 'Pending';
  statusTypes = ['Pending', 'Approved', 'Rejected'];

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';
  currentActivityState: string = '';

  statusFormControlChangedSubscription!: Subscription;
  courseScheduleFormControlChangedSubscription!: Subscription;
  departmentFormControlChangedSubscription!: Subscription;
  ensureDialogSubscription!: Subscription;
  courseScheduleSelectDialogSubscription!: Subscription;
  lectureTypeSubscription!: Subscription;
  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  departmentsSubscription!: Subscription;

  displayedColumns = [
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

    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.currentUserId = this.currentUser.id;
        this.showAdminFeatures = this.currentUser.roles.includes('ROLE_ADMIN');
        this.showSecretaryFeatures = this.currentUser.roles.includes('ROLE_SECRETARY');
        this.showStudentFeatures = this.currentUser.roles.includes('ROLE_STUDENT');

        if (this.showSecretaryFeatures || this.showStudentFeatures) {
          this.selectedDepartmentId = this.currentUser.department.id.toString();
          // this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);
          console.log("Selected department Id: " + this.selectedDepartmentId);
          this.excuseApplicationService.excuseApplicationTableLoadedSubject.next(true);
        }
      }
    });

    this.searchExcuseApplicationForm = this.formBuilder.group({
      departmentId: [this.selectedDepartmentId],
      courseSchedule: [null],
      lectureTypeName : [this.selectedLectureTypeName],
      status: [this.selectedStatus]
    });

    this.lectureTypeSubscription = this.lectureTypeService.getAllLectureTypes()
    .pipe(first())
    .subscribe(lectureTypes => {
      this.lectureTypes = lectureTypes;
      console.log(this.lectureTypes);
    });

    if (this.showAdminFeatures) {
      this.departmentsSubscription = this.departmentService.getAllDepartments()
      .pipe(first())
      .subscribe(departments => {
        this.departments = departments;
      });
    }

    console.log("DEPARTMENT ID: "+this.selectedDepartmentId);

    if (this.showAdminFeatures) {
      this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);
    }

    this.dataSource = new ExcuseApplicationsDataSource(this.excuseApplicationService);

    if (+this.searchExcuseApplicationForm.value.departmentId && !this.showStudentFeatures) {
      this.dataSource.loadDepartmentExcuseApplications(this.currentUserId,
        +this.selectedDepartmentId, +this.selectedCourseScheduleId, this.selectedLectureTypeName,
        this.selectedStatus, '', 0, 3, 'asc', this.currentColumnDef);
    }

    if (this.showStudentFeatures) {
      this.dataSource.loadUserExcuseApplications(
        this.currentUserId, +this.selectedCourseScheduleId, this.selectedLectureTypeName,
        this.selectedStatus, '', 0, 3, 'asc', this.currentColumnDef);
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

        this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
        this.onSubmit();
      }
    });

    this.departmentFormControlChangedSubscription = this.searchExcuseApplicationForm.controls.departmentId.valueChanges.subscribe(() => {
      console.log("Changed Department's value !");
      this.checkForCourseScheduleValue();
      this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);
      console.log("New published department value: "+(+this.selectedDepartmentId));
    });

    this.courseScheduleFormControlChangedSubscription = this.searchExcuseApplicationForm.controls.courseSchedule.valueChanges
    .subscribe((courseSchedule: CourseSchedule) => {
      console.log("Changed CourseSchedule's value !");
      if (courseSchedule) {
        this.removeTableElement('course');
      } else {
        this.addTableElement('course');
      }
    });

    this.statusFormControlChangedSubscription = this.searchExcuseApplicationForm.controls.status.valueChanges
    .subscribe((status: string) => {
      console.log("Changed Status value !");
      if (status === '') {
        this.addTableElement('status');
      } else {
        this.removeTableElement('status');
      }
    });

    this.statusFormControlChangedSubscription = this.searchExcuseApplicationForm.controls.status.valueChanges
    .subscribe((status: string) => {
      console.log("Changed Status value !");
      if (status === '') {
        this.addTableElement('status');
      } else {
        this.removeTableElement('status');
      }
    });
  }

  get f() { return this.searchExcuseApplicationForm.controls; }

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

  selectedStatusModerator(): boolean | null {
    return this.selectedStatus === 'Pending' ? null : (this.selectedStatus === 'Approved' ? true : false);
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
      lectureTypeName: '',
      status: 'Pending'
    });
    this.selectedCourseSchedule = null;
    this.selectedCourseScheduleId = '';
    this.selectedLectureTypeName = '';
    this.selectedStatus = 'Pending';

    // is usefull to next the courseSchedule --> For Admin Features Yes !!!
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
    if (!this.showStudentFeatures) {
      this.dataSource.loadDepartmentExcuseApplications(
        this.currentUserId,
        +this.selectedDepartmentId,
        +this.selectedCourseScheduleId,
        this.selectedLectureTypeName,
        this.selectedStatus,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
    }
    if (this.showStudentFeatures) {
      this.dataSource.loadUserExcuseApplications(
        this.currentUserId,
        +this.selectedCourseScheduleId,
        this.selectedLectureTypeName,
        this.selectedStatus,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
    }

  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadExcuseApplicationsPage();
    } else {
      this.clearInput();
    }
    console.log("Excuse Application Table Subject");
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