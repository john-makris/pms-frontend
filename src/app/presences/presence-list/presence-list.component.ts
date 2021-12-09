import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatRadioButton } from '@angular/material/radio';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { LectureSelectDialogService } from 'src/app/classes-sessions/class-session-list/services/lecture-select-dialog.service';
import { ClassSessionService } from 'src/app/classes-sessions/class-session.service';
import { ClassSessionResponseData } from 'src/app/classes-sessions/common/payload/response/classSessionResponseData.interface';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { Department } from 'src/app/departments/department.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { LectureResponseData } from 'src/app/lectures/common/payload/response/lectureResponseData.interface';
import { CourseScheduleSelectDialogService } from 'src/app/lectures/lecture-edit/services/course-schedule-select-dialog.sevice';
import { LectureType } from 'src/app/lectures/lecture-types/lecture-type.model';
import { LectureTypeService } from 'src/app/lectures/lecture-types/lecture-type.service';
import { LectureService } from 'src/app/lectures/lecture.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { PresencesDataSource } from '../common/tableDataHelper/presences.datasource';
import { PresenceService } from '../presence.service';
import { ClassSessionSelectDialogService } from './services/class-session-select-dialog.service';

@Component({
  selector: 'app-presence-list',
  templateUrl: './presence-list.component.html',
  styleUrls: ['./presence-list.component.css']
})
export class PresenceListComponent implements OnInit, OnDestroy {
  searchPresencesForm!: FormGroup;

  currentUser: AuthUser | null = null;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  isLoading: boolean = false;
  submitted: boolean = false;
  ensureDialogStatus!: boolean;
  
  dataSource!: PresencesDataSource;
  departments!: Department[];

  selectedDepartmentId: string = '';

  selectedCourseScheduleId: string = '';
  selectedCourseSchedule: CourseSchedule | null = null;

  selectedLectureId: string = '';
  selectedLecture: LectureResponseData | null = null;

  selectedClassSessionId: string = '';
  selectedClassSession: ClassSessionResponseData | null = null;

  selectedLectureTypeName: string = 'Theory';

  selectedStatus: string  = '';
  statusTypes = ['Pending', 'Absent', 'Present'];

  selectedExcuseStatus: string  = '';
  excuseStatusTypes = ['Excused', 'Inexcusable'];

  lectureTypes: LectureType[] = [];
  identifierSuffixList: Array<string> = [];

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';
  currentActivityState: string = '';

  //selectedRow: ClassSession | null = null;
  //selection = new SelectionModel<ClassSession>(true, []);

  excuseStatusFormControlChangedSubscription!: Subscription;
  searchPresencesFormStatusSubscription!: Subscription;
  classSessionDialogSubscription!: Subscription;
  classSessionSelectDialogSubscription!: Subscription;
  courseScheduleSelectDialogSubscription!: Subscription;
  lectureSelectDialogSubscription!: Subscription;

  lectureTypeSubscription!: Subscription;

  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  departmentsSubscription!: Subscription;

  displayedColumns = [
    'id',
    'username',
    'firstname',
    'lastname',
    'status'
  ];

  @ViewChild(MatCheckbox) checkbox!: MatCheckbox;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatRadioButton) radioButton!: MatRadioButton;
  @ViewChild('input') input!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private departmentService: DepartmentService,
    private courseScheduleService: CourseScheduleService,
    private lectureTypeService: LectureTypeService,
    private lectureService: LectureService,
    private classSessionService: ClassSessionService,
    private presenceService: PresenceService,
    private courseScheduleSelectDialogService: CourseScheduleSelectDialogService,
    private lectureSelectDialogService: LectureSelectDialogService,
    private classSessionSelectDialogService: ClassSessionSelectDialogService,
    private snackbarService: SnackbarService,
    private authService: AuthService) {}

  ngOnInit(): void {

    this.searchPresencesForm = this.formBuilder.group({
      departmentId: [this.selectedDepartmentId],
      courseSchedule: ['', Validators.required],
      isLectureTypeNameTheory : [true, Validators.required],
      lecture: ['', Validators.required],
      classSession: ['', Validators.required],
      status: [this.selectedStatus],
      excuseStatus: [this.selectedExcuseStatus]
    });

    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.showAdminFeatures = this.currentUser.roles.includes('ADMIN');
        this.showTeacherFeatures = this.currentUser.roles.includes('TEACHER');
        this.showStudentFeatures = this.currentUser.roles.includes('STUDENT');

        if (this.showStudentFeatures) {
          this.displayedColumns = [];
          this.displayedColumns = ['name', 'startTime', 'capacity', 'subscription'];
        }
      }
    });

    this.lectureTypeSubscription = this.lectureTypeService.getAllLectureTypes()
    .pipe(first())
    .subscribe(lectureTypes => {
      this.lectureTypes = lectureTypes;
      console.log(this.lectureTypes);
      this.publishLectureType();
    });

    this.departmentsSubscription = this.departmentService.getAllDepartments()
    .pipe(first())
    .subscribe(departments => {
      this.departments = departments;
    });

    console.log("DEPARTMENT ID: "+this.selectedDepartmentId);

    this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);

    this.dataSource = new PresencesDataSource(this.presenceService);

    if (this.searchPresencesForm.valid) {
      this.dataSource.loadPresences(+this.selectedClassSessionId, 
        this.selectedStatus, this.selectedExcuseStatus, '', 0, 3, 'asc', this.currentColumnDef);
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
        this.searchPresencesForm.patchValue({
          courseSchedule: _courseSchedule
        });
        this.selectedCourseSchedule = _courseSchedule;
        this.selectedCourseScheduleId = _courseSchedule.id.toString();
        this.searchPresencesForm.patchValue({
          isLectureTypeNameTheory: true
        });
        
        this.checkForLectureValue();

        this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
        this.publishLectureType();
      }
    });

    this.lectureSelectDialogSubscription = this.lectureSelectDialogService.lectureSelectDialogState
    .subscribe((_lecture: LectureResponseData | null) => {
      console.log("Lecture Data: "+JSON.stringify(_lecture));
      if (_lecture !== null) {
        console.log("CATCH LECTURE: "+_lecture.nameIdentifier);
        this.searchPresencesForm.patchValue({
          lecture: _lecture
        });
        this.selectedLecture = _lecture;
        this.selectedLectureId = _lecture.id.toString();

        this.checkForClassSessionValue();

        this.lectureService.lectureSubject.next(this.selectedLecture);
      }
    });

    this.classSessionDialogSubscription = this.classSessionSelectDialogService.classSessionSelectDialogState
    .subscribe((_classSession: ClassSessionResponseData | null) => {
      console.log("Class Session Data: "+JSON.stringify(_classSession));
      if (_classSession !== null) {
        console.log("CATCH CLASS SESSION: "+_classSession.nameIdentifier);
        this.searchPresencesForm.patchValue({
          classSession: _classSession
        });
        this.selectedClassSession = _classSession;
        this.selectedClassSessionId = _classSession.id.toString();

        console.log("Class session ID: "+this.selectedClassSessionId);

        this.classSessionService.classSessionSubject.next(this.selectedClassSession);
        this.clearStatusValue();
        this.onSearchPresencesFormSubmit();
      }
    });

    this.searchPresencesFormStatusSubscription = this.searchPresencesForm.controls.status.valueChanges
    .subscribe((status: string) => {
      console.log("Changed Status value !");
      if (status !== '') {
        this.removeTableElement('status');
      } else {
        this.addTableElement('status')
      }

      if (status === 'Absent') {
        this.addTableElement('excuseStatus')
      } else {
        this.removeTableElement('excuseStatus');
      }
    });

    this.excuseStatusFormControlChangedSubscription = this.searchPresencesForm.controls.excuseStatus.valueChanges
    .subscribe((excuseStatus: string) => {
      console.log("Changed Excuse Status value !");
      if (excuseStatus !== '') {
        this.removeTableElement('excuseStatus');
      } else {
        this.addTableElement('excuseStatus');
      }
    });

  }

  get spf() { return this.searchPresencesForm.controls; }

  removeTableElement(tableElement: String) {
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

  checkForCourseScheduleValue() {
    if (this.searchPresencesForm.value.courseSchedule) {
      this.clearCourseScheduleValue();
    }
  }

  checkForLectureValue() {
    if (this.searchPresencesForm.value.lecture) {
      this.clearLectureAndResfresh();
    }
  }

  
  checkForClassSessionValue() {
    if (this.searchPresencesForm.value.classSession) {
      this.clearClassSessionAndRefresh();
    }
  }

  onSearchPresencesFormSubmit() {
    this.router.navigate(['/presences'], { relativeTo: this.route });
    this.submitted = true;

    if(this.searchPresencesForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.paginator.pageIndex = 0;
    this.sort.direction='asc'

    /* For future usage in Presence Maybe
    if (this.currentUser && this.showStudentFeatures) {
      this.classGroupSubscription = this.groupStudentService.getClassGroupByStudentIdAndCourseScheduleIdAndGroupType(
        this.currentUser.id, +this.selectedCourseScheduleId, this.selectedLectureTypeName)
      .subscribe((classGroup: ClassSession | null) => {
        if (classGroup) {
          this.selectedRow = classGroup;
          console.log("Class Group: "+JSON.stringify(classGroup));
        }
      });
    } */

    this.searchPresencesFormStatusSubscription = this.searchPresencesForm.controls.status.valueChanges
    .subscribe((status: string) => {
      console.log("The status changed");
      if (status !== 'Absent' && this.searchPresencesForm.controls.excuseStatus.value !== '') {
        this.searchPresencesForm.patchValue({
          excuseStatus: ''
        });
        this.selectedExcuseStatus = '';
        this.removeTableElement('excuseStatus');
      }
    });

    this.refreshTable();
  }

  selectedLectureTypeModerator() {
    this.selectedLectureTypeName = this.searchPresencesForm.value.isLectureTypeNameTheory ? 'Theory' : 'Lab';
  }

  clearCourseScheduleValue() {
    this.searchPresencesForm.patchValue({
      courseSchedule: '',
      isLectureTypeNameTheory: true
    });
    this.selectedCourseSchedule = null;
    this.selectedCourseScheduleId = '';
    this.selectedLectureTypeName = 'Theory';
    this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
    this.clearLectureValue();
    this.clearClassSessionValue();
    this.router.navigate(['/presences'], { relativeTo: this.route});
    this.refreshTable();
  }

  clearLectureAndResfresh() {
    this.clearLectureValue();
    this.refreshTable();
  }

  clearClassSessionAndRefresh() {
    this.clearClassSessionValue();
    this.refreshTable();
  }

  clearLectureValue() {
    this.searchPresencesForm.patchValue({
      lecture: ''
    });

    this.selectedLecture = null;
    this.selectedLectureId = '';

    this.lectureService.lectureSubject.next(this.selectedLecture);
    this.clearClassSessionValue();
  }

  clearClassSessionValue() {
    this.searchPresencesForm.patchValue({
      classSession: ''
    });

    this.selectedClassSession = null;
    this.selectedClassSessionId = '';
    this.classSessionService.classSessionSubject.next(this.selectedClassSession);
    this.clearStatusValue();
  }

  clearStatusValue() {
    this.searchPresencesForm.patchValue({
      status: ''
    });

    this.selectedStatus = '';
    this.clearExcuseStatusValue();
  }

  clearExcuseStatusValue() {
    this.searchPresencesForm.patchValue({
      excuseStatus: ''
    });

    this.selectedExcuseStatus = '';
    this.removeTableElement('excuseStatus');
  }

  onLectureTypeSelect(lectureTypeNameSelection: boolean) {
    this.searchPresencesForm.patchValue({
      isLectureTypeNameTheory: lectureTypeNameSelection
    });
    this.selectedLectureTypeModerator();
    this.publishLectureType();
    this.checkForLectureValue();
    this.checkForClassSessionValue();
    this.refreshTable();
  }

  selectCourseSchedule() {
    this.courseScheduleSelectDialogService.selectCourseSchedule(this.searchPresencesForm.value.courseSchedule);
  }

  selectLecture() {
    this.lectureSelectDialogService.selectLecture(this.searchPresencesForm.value.lecture);
  }

  selectClassSession() {
    this.classSessionSelectDialogService.selectClassSession(this.searchPresencesForm.value.classSession);
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

                this.loadPresencesPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadPresencesPage())
    )
    .subscribe();
  }

  loadPresencesPage() {
    this.dataSource.loadPresences(
        +this.selectedClassSessionId,
        this.selectedStatus,
        this.selectedExcuseStatus,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadPresencesPage();
    } else {
      this.clearInput();
    }
    if (+this.selectedClassSessionId) {
      this.presenceService.presenceTableLoadedSubject.next(true);
    } else {
      this.presenceService.presenceTableLoadedSubject.next(false);
    }
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadPresencesPage();
  }

  publishLectureType() {
    if (this.lectureTypes.length !== 0) {
      const found = this.lectureTypes.find(lectureType => lectureType.name === this.selectedLectureTypeName);
      console.log("FOUND: "+JSON.stringify(found));
      if (found) {
        this.lectureTypeService.lectureTypeSubject.next(found);
      }
    }
  }
  
  ngOnDestroy(): void {
    if (this.courseScheduleSelectDialogSubscription) {
      this.courseScheduleSelectDialogSubscription.unsubscribe();
    }
    if (this.lectureSelectDialogSubscription) {
      this.lectureSelectDialogSubscription.unsubscribe();
    }
    if (this.classSessionDialogSubscription) {
      this.classSessionDialogSubscription.unsubscribe();
    }
    if (this.lectureTypeSubscription) {
      this.lectureTypeSubscription.unsubscribe();
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
    if (this.excuseStatusFormControlChangedSubscription) {
      this.excuseStatusFormControlChangedSubscription.unsubscribe();
    }
    if (this.searchPresencesFormStatusSubscription) {
      this.searchPresencesFormStatusSubscription.unsubscribe();
    }
  }
}