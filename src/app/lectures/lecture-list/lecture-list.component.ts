import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
import { AuthUser } from 'src/app/users/auth-user.model';
import { LecturesDataSource } from '../common/tableDataHelper/lectures.datasource';
import { CourseScheduleSelectDialogService } from '../lecture-edit/services/course-schedule-select-dialog.sevice';
import { LectureType } from '../lecture-types/lecture-type.model';
import { LectureTypeService } from '../lecture-types/lecture-type.service';
import { LectureService } from '../lecture.service';

@Component({
  selector: 'app-lecture-list',
  templateUrl: './lecture-list.component.html',
  styleUrls: ['./lecture-list.component.css']
})
export class LectureListComponent implements OnInit, AfterViewInit, OnDestroy {
  searchLecturesForm!: FormGroup;

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  isLoading: boolean = false;
  submitted: boolean = false;
  
  dataSource!: LecturesDataSource;
  departments!: Department[];
  selectedDepartmentId: string = '';
  selectedCourseScheduleId: string = '';
  selectedCourseSchedule: CourseSchedule | null = null;
  selectedLectureTypeName: string = 'Theory';
  lectureTypes: LectureType[] = [];
  identifierSuffixList: Array<string> = [];

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'name';
  currentActivityState: string = '';

  departmentIdFormControlChangedSubscription!: Subscription;
  courseScheduleSelectDialogSubscription!: Subscription;
  lectureTypeSubscription!: Subscription;
  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  departmentsSubscription!: Subscription;

  displayedColumns = [
    'id',
    'name',
    'title'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatRadioButton) radioButton!: MatRadioButton;
  @ViewChild('input') input!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private lectureService: LectureService,
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
        this.showAdminFeatures = this.currentUser.roles.includes('ROLE_ADMIN');
        this.showTeacherFeatures = this.currentUser.roles.includes('ROLE_TEACHER');

        if (this.showTeacherFeatures && !this.showAdminFeatures) {
          this.currentUserId = this.currentUser.id;
          console.log("Current User Id: "+this.currentUserId);
          this.selectedDepartmentId = this.currentUser.department.id.toString();
          console.log("Teachers department: "+this.selectedDepartmentId);
        }
      }
    });

    this.searchLecturesForm = this.formBuilder.group({
      departmentId: [this.selectedDepartmentId],
      courseSchedule: [''],
      isLectureTypeNameTheory : [true]
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

    /*this.lectureTypeSubscription = this.lectureTypeService.lectureTypeIdState.subscribe((lectureType: string) => {
      console.log("I am inside lecture type subscriber: "+lectureType);
      let isLectureTypeTheoryValue: boolean = false;
      if (lectureType === 'Theory') {
        isLectureTypeTheoryValue = true;
      }
      this.searchLecturesForm.patchValue({
        isLectureTypeTheory: isLectureTypeTheoryValue
      });
      this.selectedLectureTypeModerator();
    });*/

    console.log("DEPARTMENT ID: "+this.selectedDepartmentId);

    this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);

    this.dataSource = new LecturesDataSource(this.lectureService);

    if (+this.searchLecturesForm.value.departmentId && +this.selectedCourseScheduleId) {
      if (this.showAdminFeatures) {
        this.dataSource.loadLectures(this.currentUserId, +this.selectedCourseScheduleId,
          this.selectedLectureTypeName, '', 0, 3, 'asc', this.currentColumnDef);
      } else {
        if (this.currentUserId !== 0) {
          this.dataSource.loadLectures(this.currentUserId, +this.selectedCourseScheduleId,
            this.selectedLectureTypeName, '', 0, 3, 'asc', this.currentColumnDef);
        }
      }

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
        this.searchLecturesForm.patchValue({
          courseSchedule: _courseSchedule
        });
        this.selectedCourseSchedule = _courseSchedule;
        this.selectedCourseScheduleId = _courseSchedule.id.toString();
        this.searchLecturesForm.patchValue({
          isLectureTypeNameTheory: true
        });
        this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
        this.onSearchLecturesFormSubmit();
      }
    });

    this.departmentIdFormControlChangedSubscription = this.searchLecturesForm.controls.departmentId.valueChanges
      .subscribe((departmentId: string) => {
        console.log("Lecture Search departmentId value: "+(+departmentId));
        this.departmentService.departmentIdSubject.next(+departmentId);
      });

  }

  get slf() { return this.searchLecturesForm.controls; }

  checkForCourseScheduleValue() {
    if (this.searchLecturesForm.value.courseSchedule) {
      this.clearCourseScheduleValue();
    }
  }

  onSearchLecturesFormSubmit() {
    this.router.navigate(['/lectures'], { relativeTo: this.route });
    this.submitted = true;
    //console.log("HAAAAALOOOO!!!");
    if(this.searchLecturesForm.invalid) {
      return;
    }

    this.isLoading = true;
    //console.log("Course Schedule ID: "+ this.selectCourseScheduleForm.value.courseSchedule.id);
    this.selectedDepartmentId = this.searchLecturesForm.value.departmentId;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize;
    this.sort.direction='asc'
    //this.currentColumnDef;
    console.log("Course Schedule ID: "+this.selectedCourseScheduleId);
    this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);

    console.log("Selected value: "+this.searchLecturesForm.value.isLectureTypeNameTheory);
    this.selectedLectureTypeModerator();
    console.log("Selected lecture type: "+this.selectedLectureTypeName);
    this.publishLectureType();
    this.identifierSuffixModerator();
    this.lectureService.identifierSuffixesSubject.next(this.identifierSuffixList);

    this.refreshTable();
  }

  selectedLectureTypeModerator() {
    this.selectedLectureTypeName = this.searchLecturesForm.value.isLectureTypeNameTheory ? 'Theory' : 'Lab';
  }

  clearCourseScheduleValue() {
    this.searchLecturesForm.patchValue({
      courseSchedule: '',
      isLectureTypeNameTheory: true
    });
    this.selectedCourseSchedule = null;
    this.selectedCourseScheduleId = '';
    this.selectedLectureTypeName = 'Theory';
    this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
    this.router.navigate(['/lectures'], { relativeTo: this.route});
    this.refreshTable();
  }

  onLectureTypeSelect(lectureTypeNameSelection: boolean) {
    this.searchLecturesForm.patchValue({
      isLectureTypeNameTheory: lectureTypeNameSelection
    });
    this.onSearchLecturesFormSubmit();
  }

  selectCourseSchedule() {
    this.courseScheduleSelectDialogService.selectCourseSchedule(this.searchLecturesForm.value.courseSchedule);
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

                this.loadLecturesPage();
            })
        )
        .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadLecturesPage())
    )
    .subscribe();
  }

  loadLecturesPage() {
    this.dataSource.loadLectures(
        this.currentUserId,
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
      this.loadLecturesPage();
    } else {
      this.clearInput();
    }
    this.lectureService.lectureTableLoadedSubject.next(true);
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadLecturesPage();
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
    if (this.lectureTypeSubscription) {
      this.lectureTypeSubscription.unsubscribe();
    }
    if (this.courseScheduleSelectDialogSubscription) {
      this.courseScheduleSelectDialogSubscription.unsubscribe();
    }
    if (this.departmentIdFormControlChangedSubscription) {
      this.departmentIdFormControlChangedSubscription.unsubscribe();
    }
 }
 
}