import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatRadioButton } from '@angular/material/radio';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { ClassGroup } from 'src/app/classes-groups/class-group.model';
import { ClassGroupService } from 'src/app/classes-groups/class-group.service';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { Department } from 'src/app/departments/department.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { GroupStudentService } from 'src/app/groups-students/group-student.service';
import { CourseScheduleSelectDialogService } from 'src/app/lectures/lecture-edit/services/course-schedule-select-dialog.sevice';
import { LectureSelectDialogService } from 'src/app/classes-sessions/class-session-list/services/lecture-select-dialog.service';
import { LectureType } from 'src/app/lectures/lecture-types/lecture-type.model';
import { LectureTypeService } from 'src/app/lectures/lecture-types/lecture-type.service';
import { Lecture } from 'src/app/lectures/lecture.model';
import { LectureService } from 'src/app/lectures/lecture.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { ClassSession } from '../class-session.model';
import { ClassSessionService } from '../class-session.service';
import { ClassesSessionsDataSource } from '../common/tableDataHelper/classes-sessions.datasource';
import { LectureResponseData } from 'src/app/lectures/common/payload/response/lectureResponseData.interface';
import { ClassGroupSelectDialogService } from 'src/app/groups-students/group-student-list/services/class-group-select-dialog.service';
import { ClassGroupResponseData } from 'src/app/classes-groups/common/payload/response/classGroupResponseData.interface';

@Component({
  selector: 'app-class-session-list',
  templateUrl: './class-session-list.component.html',
  styleUrls: ['./class-session-list.component.css']
})
export class ClassSessionListComponent implements OnInit {
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

  //selectedClassGroupId: string = '';
  //selectedClassGroup: ClassGroupResponseData | null = null;

  selectedLectureTypeName: string = 'Theory';

  lectureTypes: LectureType[] = [];
  identifierSuffixList: Array<string> = [];

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'nameIdentifier';
  currentActivityState: string = '';

  selectedRow: ClassSession | null = null;
  selection = new SelectionModel<ClassSession>(true, []);

  classGroupSubscription!: Subscription;
  ensureDialogSubscription!: Subscription;
  createGroupStudentSubscription!: Subscription;


  //classGroupSelectDialogSubscription!: Subscription;
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

  /*
  checkForGroupValue() {
    if (this.searchClassesSessionsForm.value.classGroup) {
      this.clearClassGroupValue();
    }
  } */

  onSearchClassesSessionsFormSubmit() {
    this.router.navigate(['/classes-sessions'], { relativeTo: this.route });
    this.submitted = true;

    if(this.searchClassesSessionsForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.paginator.pageIndex = 0;
    this.sort.direction='asc'

    //this.identifierSuffixModerator();
    //this.classSessionService.identifierSuffixesSubject.next(this.identifierSuffixList);

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

  /*
  clearClassGroupAndRefresh() {
    this.clearClassGroupValue();
    this.refreshTable();
  }*/

  clearLectureValue() {
    this.searchClassesSessionsForm.patchValue({
      lecture: ''
    });

    this.selectedLecture = null;
    this.selectedLectureId = '';

    this.lectureService.lectureSubject.next(this.selectedLecture);
    //this.clearClassGroupValue();
  }

  /*
  clearClassGroupValue() {
    this.searchClassesSessionsForm.patchValue({
      classGroup: ''
    });

    this.selectedClassGroup = null;
    this.selectedClassGroupId = '';
    this.classGroupService.classGroupSubject.next(this.selectedClassGroup);
  }*/

  onLectureTypeSelect(lectureTypeNameSelection: boolean) {
    this.searchClassesSessionsForm.patchValue({
      isLectureTypeNameTheory: lectureTypeNameSelection
    });
    this.selectedLectureTypeModerator();
    this.publishLectureType();
    this.checkForLectureValue();
    //this.checkForGroupValue();
    this.refreshTable();
  }

  selectCourseSchedule() {
    this.courseScheduleSelectDialogService.selectCourseSchedule(this.searchClassesSessionsForm.value.courseSchedule);
  }

  selectLecture() {
    this.lectureSelectDialogService.selectLecture(this.searchClassesSessionsForm.value.lecture);
  }

  /*selectClassGroup() {
    this.classGroupSelectDialogService.selectClassGroup(this.searchClassesSessionsForm.value.classGroup);
  }*/

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

                this.loadClassesGroupsPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadClassesGroupsPage())
    )
    .subscribe();
  }

  loadClassesGroupsPage() {
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
      this.loadClassesGroupsPage();
    } else {
      this.clearInput();
    }
    this.classSessionService.classSessionTableLoadedSubject.next(true);
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadClassesGroupsPage();
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

  identifierSuffixModerator() {
      this.identifierSuffixList = [];
      if (this.selectedCourseSchedule) {
        if (this.selectedLectureTypeName === 'Theory') {
          this.fillOutIdentifierSuffixList(this.selectedCourseSchedule.maxTheoryLectures);
        } else if (this.selectedLectureTypeName === 'Lab') {
          this.fillOutIdentifierSuffixList(this.selectedCourseSchedule.maxLabLectures);
        } else {
          this.identifierSuffixList = [];
        }
      }
  }

  fillOutIdentifierSuffixList(numberOfLectures: number) {
    for (let i = 0; i < numberOfLectures; i++) {
      this.identifierSuffixList.push((i+1).toString());
    }
  }

  
  OnDestroy() {

  }
  
}
