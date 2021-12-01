import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatRadioButton } from '@angular/material/radio';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, first, last, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { Department } from 'src/app/departments/department.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { CourseScheduleSelectDialogService } from 'src/app/lectures/lecture-edit/services/course-schedule-select-dialog.sevice';
import { LectureSelectDialogService } from 'src/app/classes-sessions/class-session-list/services/lecture-select-dialog.service';
import { LectureType } from 'src/app/lectures/lecture-types/lecture-type.model';
import { LectureTypeService } from 'src/app/lectures/lecture-types/lecture-type.service';
import { LectureService } from 'src/app/lectures/lecture.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { ClassSession } from '../class-session.model';
import { ClassSessionService } from '../class-session.service';
import { ClassesSessionsDataSource } from '../common/tableDataHelper/classes-sessions.datasource';
import { LectureResponseData } from 'src/app/lectures/common/payload/response/lectureResponseData.interface';
import { PresenceRequestData } from 'src/app/presences/common/payload/request/presenceRequestData.interface';
import { PresenceService } from 'src/app/presences/presence.service';
import { PresenceResponseData } from 'src/app/presences/common/payload/response/presenceResponseData.interface';
import { ClassSessionResponseData } from '../common/payload/response/classSessionResponseData.interface';
import { ClassesSessionsResponseData } from '../common/payload/response/classesSessionsResponseData.interface';

@Component({
  selector: 'app-class-session-list',
  templateUrl: './class-session-list.component.html',
  styleUrls: ['./class-session-list.component.css']
})
export class ClassSessionListComponent implements OnInit, OnDestroy {
  searchClassesSessionsForm!: FormGroup;

  currentUser: AuthUser | null = null;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  isLoading: boolean = false;
  submitted: boolean = false;
  ensureDialogStatus!: boolean;
  
  dataSource!: ClassesSessionsDataSource;
  departments!: Department[];

  selectedDepartmentId: string = '';

  selectedCourseScheduleId: string = '';
  selectedCourseSchedule: CourseSchedule | null = null;

  selectedLectureId: string = '';
  selectedLecture: LectureResponseData | null = null;

  selectedLectureTypeName: string = 'Theory';

  currentPresence: PresenceResponseData | null = null;

  lectureTypes: LectureType[] = [];

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'nameIdentifier';
  currentActivityState: string = '';

  selectedRow: ClassSessionResponseData | null = null;
  selection = new SelectionModel<ClassSessionResponseData>(true, []);

  updatePresenceSubscription!: Subscription;
  classSessionSubscription!: Subscription;

  courseScheduleSelectDialogSubscription!: Subscription;
  lectureSelectDialogSubscription!: Subscription;

  lectureTypeSubscription!: Subscription;

  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  departmentsSubscription!: Subscription;

  displayedColumns = [
    'id',
    'nameIdentifier',
    'date',
    'classGroup',
    'presenceStatementStatus'
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
    private presenceService: PresenceService,
    private classSessionService: ClassSessionService,
    private lectureTypeService: LectureTypeService,
    private courseScheduleService: CourseScheduleService,
    private courseScheduleSelectDialogService: CourseScheduleSelectDialogService,
    private lectureService: LectureService,
    private lectureSelectDialogService: LectureSelectDialogService,
    private snackbarService: SnackbarService,
    private departmentService: DepartmentService,
    private authService: AuthService) {}


  ngOnInit(): void {

    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.showAdminFeatures = this.currentUser.roles.includes('ADMIN');
        this.showTeacherFeatures = this.currentUser.roles.includes('TEACHER');
        this.showStudentFeatures = true;
        // this.currentUser.roles.includes('STUDENT');

        if (this.showStudentFeatures) {
          this.displayedColumns = [];
          this.displayedColumns = ['id', 'nameIdentifier', 'date', 'classGroup', 'presenceStatement'];
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

    this.searchClassesSessionsForm = this.formBuilder.group({
      departmentId: [this.selectedDepartmentId],
      courseSchedule: ['', Validators.required],
      isLectureTypeNameTheory : [true, Validators.required],
      lecture: ['', Validators.required]
    });

    console.log("DEPARTMENT ID: "+this.selectedDepartmentId);

    this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);

    this.dataSource = new ClassesSessionsDataSource(this.classSessionService);

    if (this.searchClassesSessionsForm.valid) {
      this.dataSource.loadClassesSessions(
        +this.selectedLectureId, '', 0, 3, 'asc', this.currentColumnDef);
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
        } else if(this.currentActivityState.includes('updated') || this.currentActivityState.includes('opened')
        || this.currentActivityState.includes('closed')) {
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
        this.searchClassesSessionsForm.patchValue({
          courseSchedule: _courseSchedule
        });
        this.selectedCourseSchedule = _courseSchedule;
        this.selectedCourseScheduleId = _courseSchedule.id.toString();
        this.searchClassesSessionsForm.patchValue({
          isLectureTypeNameTheory: true
        });
        
        this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
        this.publishLectureType();
      }
    });

    this.lectureSelectDialogSubscription = this.lectureSelectDialogService.lectureSelectDialogState
    .subscribe((_lecture: LectureResponseData | null) => {
      console.log("Lecture Data: "+JSON.stringify(_lecture));
      if (_lecture !== null) {
        console.log("CATCH LECTURE: "+_lecture.nameIdentifier);
        this.searchClassesSessionsForm.patchValue({
          lecture: _lecture
        });
        this.selectedLecture = _lecture;
        this.selectedLectureId = _lecture.id.toString();

        this.lectureService.lectureSubject.next(this.selectedLecture);
        this.onSearchClassesSessionsFormSubmit();
      }
    });
  }

  get scsf() { return this.searchClassesSessionsForm.controls; }

  checkForCourseScheduleValue() {
    if (this.searchClassesSessionsForm.value.courseSchedule) {
      this.clearCourseScheduleValue();
    }
  }

  checkForLectureValue() {
    if (this.searchClassesSessionsForm.value.lecture) {
      this.clearLectureValue();
    }
  }

  onSearchClassesSessionsFormSubmit() {
    this.router.navigate(['/classes-sessions'], { relativeTo: this.route });
    this.submitted = true;

    if(this.searchClassesSessionsForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.paginator.pageIndex = 0;
    this.sort.direction='asc';

    // For future usage in ClassSession Maybe
    if (this.currentUser && this.showStudentFeatures) {     // lectureId, studentId, 
      this.classSessionSubscription = this.classSessionService.getClassSessionByLectureIdAndStudentId(
        +this.selectedLectureId, this.currentUser.id)
      .subscribe((classSession: ClassSessionResponseData | null) => {
        if (classSession) {
          this.selectedRow = classSession;
          console.log("Class Session: "+JSON.stringify(classSession));
        }
      });
    }

    this.refreshTable();
  }

  selectedLectureTypeModerator() {
    this.selectedLectureTypeName = this.searchClassesSessionsForm.value.isLectureTypeNameTheory ? 'Theory' : 'Lab';
  }

  clearCourseScheduleValue() {
    this.searchClassesSessionsForm.patchValue({
      courseSchedule: '',
      isLectureTypeNameTheory: true
    });
    this.selectedCourseSchedule = null;
    this.selectedCourseScheduleId = '';
    this.selectedLectureTypeName = 'Theory';
    this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
    this.clearLectureValue();
    //this.clearClassGroupValue();
    this.router.navigate(['/classes-sessions'], { relativeTo: this.route});
    this.refreshTable();
  }

  clearLectureAndResfresh() {
    this.clearLectureValue();
    this.refreshTable();
  }

  clearLectureValue() {
    this.searchClassesSessionsForm.patchValue({
      lecture: ''
    });

    this.selectedLecture = null;
    this.selectedLectureId = '';

    this.lectureService.lectureSubject.next(this.selectedLecture);
  }

  onLectureTypeSelect(lectureTypeNameSelection: boolean) {
    this.searchClassesSessionsForm.patchValue({
      isLectureTypeNameTheory: lectureTypeNameSelection
    });
    this.selectedLectureTypeModerator();
    this.publishLectureType();
    this.checkForLectureValue();
    this.refreshTable();
  }

  selectCourseSchedule() {
    this.courseScheduleSelectDialogService.selectCourseSchedule(this.searchClassesSessionsForm.value.courseSchedule);
  }

  selectLecture() {
    this.lectureSelectDialogService.selectLecture(this.searchClassesSessionsForm.value.lecture);
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

                this.loadClassesSessionsPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadClassesSessionsPage())
    )
    .subscribe();
  }

  loadClassesSessionsPage() {
    this.dataSource.loadClassesSessions(
        +this.selectedLectureId,
        this.input.nativeElement.value,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.sort.direction,
        this.currentColumnDef);
  }
  
  refreshTable() {
    //console.log("INPUT VALUE: "+this.input.nativeElement.value);
    if (this.input.nativeElement.value === '') {
      this.loadClassesSessionsPage();
    } else {
      this.clearInput();
    }
    this.classSessionService.classSessionTableLoadedSubject.next(true);
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadClassesSessionsPage();
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

  simpleCheck(row: any): boolean {
    let result: boolean = false;
    if (this.selectedRow !== null) {
      result = this.selectedRow.id === row.id;
    }
    if (!result) {
      //this.selection.deselect(row);
      if (this.selectedRow?.classGroup.groupType.name !== row?.classGroup.groupType.name) {
        return true;
      }
      return false;
    } else {
      //this.selection.isSelected(row);
      //this.selection.select(row);
      //console.log(row.id);
      return true;
    }
  }

  check(row: any): boolean {
    let result: boolean = false;
    if (this.selectedRow !== null) {
      result = this.selectedRow.id === row.id;
    }
    if (!result) {
      //console.log("Deselect");
      this.selection.deselect(row);
      return false;
    } else {
      //console.log("Select");
      //this.selection.isSelected(row);
      this.selection.select(row);
      console.log(row.id);
      return true;
    }
  }

  selectHandler(row: any) {
    let result: boolean = false;
    console.log("Select Handler:");
    this.selection.toggle(row);
    console.log("SPOT A -> selectedRow: "+this.selectedRow);
    if (this.selectedRow !== null) {
      result = this.selectedRow.id === row.id;
    }
    console.log("SPOT B -> isSelected: "+this.selection.isSelected(row));
    console.log("SPOT C -> result: "+result);
    console.log("SPOT D -> !result: "+!result);
    if (this.selection.isSelected(row)) {
      if(!result) {
        this.selectedRow = row;
        console.log("New selection: "+row.classGroup.courseSchedule.course.name+", "+row.nameIdentifier);
        console.log("capacity: "+JSON.stringify(row));
        this.check(row);
        if (this.currentUser) {
          this.updatePresenceStatus(this.createPresenceData(row.id, this.currentUser.id, true));
        }
        console.log("Data pushed! "+this.selectedRow?.classGroup.courseSchedule.course.name+", "+this.selectedRow?.classGroup.nameIdentifier);
      }
    }

    /*
      else {
        console.log("SPOT E -> selectedRow, currentUser: "+this.selectedRow, this.currentUser);
        if (this.selectedRow && this.currentUser) {
          this.updatePresenceStatus(this.createPresenceData(row.id, this.currentUser.id, false));
        }
        this.unCheck(row);
        console.log("Data removed! "+this.selectedRow);
      }
    */

  }

  unCheck(data: any) {
    if (this.selectedRow !== null) {
      if (data.id === this.selectedRow.id) {
        console.log("Still exists ..."+data.classGroup.courseSchedule.course.name+", "+data.nameIdentifier);
      }
      console.log("DELETE");
      if (data.id === this.selectedRow.id) {
        this.selectedRow = null;
      }
    }
  }

  createPresenceData(classSessionId: number, studentId: number, status: boolean): PresenceRequestData {
    const presenceData : PresenceRequestData = {
      status: status,
      classSessionId: classSessionId,
      studentId: studentId
    };
    return presenceData;
  }

  private updatePresenceStatus(presenceData: PresenceRequestData) {
    this.updatePresenceSubscription = this.presenceService.updatePresenceStatus(presenceData)
      .pipe(last())
      .pipe(
        catchError(err => {
          console.log("Error message: "+err.error.message);
            this.unCheck(this.selectedRow);
            return throwError(err);
        })
      )
      .subscribe(() => {
        this.snackbarService.success('Presence statement was successfully');
      }).add(() => this.isLoading = false);
  }
  
  ngOnDestroy(): void {
    if (this.courseScheduleSelectDialogSubscription) {
      this.courseScheduleSelectDialogSubscription.unsubscribe();
    }
    if (this.lectureSelectDialogSubscription) {
      this.lectureSelectDialogSubscription.unsubscribe();
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
    if (this.classSessionSubscription) {
      this.classSessionSubscription.unsubscribe();
    }
  }
  
}