import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatRadioButton } from '@angular/material/radio';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription, throwError } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, last, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { Department } from 'src/app/departments/department.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { GroupStudentRequestData } from 'src/app/groups-students/common/payload/request/groupStudentRequestData.interface';
import { GroupStudentService } from 'src/app/groups-students/group-student.service';
import { CourseScheduleSelectDialogService } from 'src/app/lectures/lecture-edit/services/course-schedule-select-dialog.sevice';
import { LectureType } from 'src/app/lectures/lecture-types/lecture-type.model';
import { LectureTypeService } from 'src/app/lectures/lecture-types/lecture-type.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { ClassGroup } from '../class-group.model';
import { ClassGroupService } from '../class-group.service';
import { ClassesGroupsDataSource } from '../common/tableDataHelper/classes-groups.datasource';

@Component({
  selector: 'app-class-group-list',
  templateUrl: './class-group-list.component.html',
  styleUrls: ['./class-group-list.component.css']
})
export class ClassGroupListComponent implements OnInit, OnDestroy {
  searchClassesGroupsForm!: FormGroup;

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  isLoading: boolean = false;
  submitted: boolean = false;
  ensureDialogStatus!: boolean;
  
  dataSource!: ClassesGroupsDataSource;
  departments!: Department[];
  selectedDepartmentId: string = '';
  selectedCourseScheduleId: string = '';
  selectedCourseSchedule: CourseSchedule | null = null;
  selectedLectureTypeName: string = 'Theory';
  lectureTypes: LectureType[] = [];
  identifierSuffixList: Array<string> = [];

  selectedRow: ClassGroup | null = null;
  selection = new SelectionModel<ClassGroup>(true, []);

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'name';
  currentActivityState: string = '';

  departmentIdFormControlChangedSubscription!: Subscription;
  groupStudentSubscription!: Subscription;
  ensureDialogSubscription!: Subscription;
  createGroupStudentSubscription!: Subscription;
  courseScheduleSelectDialogSubscription!: Subscription;
  lectureTypeSubscription!: Subscription;
  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  departmentsSubscription!: Subscription;

  displayedColumns = [
    'id',
    'name',
    'startTime',
    'room',
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
    private classGroupService: ClassGroupService,
    private lectureTypeService: LectureTypeService,
    private courseScheduleService: CourseScheduleService,
    private courseScheduleSelectDialogService: CourseScheduleSelectDialogService,
    private snackbarService: SnackbarService,
    private departmentService: DepartmentService,
    private groupStudentService: GroupStudentService,
    private authService: AuthService) {}


  ngOnInit(): void {

    this.lectureTypeSubscription = this.lectureTypeService.getAllLectureTypes()
    .pipe(first())
    .subscribe(lectureTypes => {
      this.lectureTypes = lectureTypes;
      console.log(this.lectureTypes);
    });

    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.currentUserId = this.currentUser.id;
        console.log("Current User Id: "+this.currentUserId);
        this.showAdminFeatures = this.currentUser.roles.includes('ROLE_ADMIN');
        this.showTeacherFeatures = this.currentUser.roles.includes('ROLE_TEACHER');
        this.showStudentFeatures = this.currentUser.roles.includes('ROLE_STUDENT');

        if (this.showStudentFeatures) {
          this.displayedColumns = [];
          this.displayedColumns = ['name', 'startTime', 'capacity', 'subscription'];
          this.selectedDepartmentId = this.currentUser.department.id.toString();
        }
        if (this.showTeacherFeatures && !this.showAdminFeatures) {
          this.selectedDepartmentId = this.currentUser.department.id.toString();
          console.log("Teachers department: "+this.selectedDepartmentId);
        }
      }
    });

    if (this.showAdminFeatures) {
      this.departmentsSubscription = this.departmentService.getAllDepartments()
      .pipe(first())
      .subscribe(departments => {
        this.departments = departments;
      });
    }

    this.searchClassesGroupsForm = this.formBuilder.group({
      departmentId: [this.selectedDepartmentId],
      courseSchedule: [''],
      isLectureTypeNameTheory : [true]
    });

    console.log("DEPARTMENT ID: "+this.selectedDepartmentId);

    this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);

    this.dataSource = new ClassesGroupsDataSource(this.classGroupService);

    if (+this.searchClassesGroupsForm.value.departmentId && +this.selectedCourseScheduleId) {
      this.dataSource.loadClassesGroups(
        this.currentUserId,
        null,
        +this.selectedCourseScheduleId,
        this.selectedLectureTypeName, '', 0, 3, 'asc', this.currentColumnDef);
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
        this.searchClassesGroupsForm.patchValue({
          courseSchedule: _courseSchedule
        });
        this.selectedCourseSchedule = _courseSchedule;
        this.selectedCourseScheduleId = _courseSchedule.id.toString();
        this.searchClassesGroupsForm.patchValue({
          isLectureTypeNameTheory: true
        });
        this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
        this.onSearchLecturesFormSubmit();
      }
    });

    this.departmentIdFormControlChangedSubscription = this.searchClassesGroupsForm.controls.departmentId.valueChanges
    .subscribe((departmentId: string) => {
      console.log("Group Search departmentId value: "+(+departmentId));
      this.departmentService.departmentIdSubject.next(+departmentId);
    });

  }

  get slf() { return this.searchClassesGroupsForm.controls; }

  checkForCourseScheduleValue() {
    if (this.searchClassesGroupsForm.value.courseSchedule) {
      this.clearCourseScheduleValue();
    }
  }

  onSearchLecturesFormSubmit() {
    this.router.navigate(['/classes-groups'], { relativeTo: this.route });
    this.submitted = true;
    //console.log("HAAAAALOOOO!!!");
    if(this.searchClassesGroupsForm.invalid) {
      return;
    }

    this.isLoading = true;
    //console.log("Course Schedule ID: "+ this.selectCourseScheduleForm.value.courseSchedule.id);
    this.selectedDepartmentId = this.searchClassesGroupsForm.value.departmentId;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize;
    this.sort.direction='asc'
    //this.currentColumnDef;
    console.log("Course Schedule ID: "+this.selectedCourseScheduleId);
    this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);

    console.log("Selected value: "+this.searchClassesGroupsForm.value.isLectureTypeNameTheory);
    this.selectedLectureTypeModerator();
    console.log("Selected lecture type: "+this.selectedLectureTypeName);
    this.publishLectureType();
    this.identifierSuffixModerator();
    this.classGroupService.identifierSuffixesSubject.next(this.identifierSuffixList);

    if (this.currentUser && this.showStudentFeatures) {
      this.groupStudentSubscription = this.groupStudentService.getClassGroupByStudentIdAndCourseScheduleIdAndGroupType(
        this.currentUser.id, +this.selectedCourseScheduleId, this.selectedLectureTypeName)
      .subscribe((classGroup: ClassGroup | null) => {
        if (classGroup) {
          this.selectedRow = classGroup;
          console.log("Class Group: "+JSON.stringify(classGroup));
        }
      });
    }

    this.refreshTable();
  }

  selectedLectureTypeModerator() {
    this.selectedLectureTypeName = this.searchClassesGroupsForm.value.isLectureTypeNameTheory ? 'Theory' : 'Lab';
  }

  clearCourseScheduleValue() {
    this.searchClassesGroupsForm.patchValue({
      courseSchedule: '',
      isLectureTypeNameTheory: true
    });
    this.selectedCourseSchedule = null;
    this.selectedCourseScheduleId = '';
    this.selectedLectureTypeName = 'Theory';
    this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
    this.router.navigate(['/classes-groups'], { relativeTo: this.route});
    this.refreshTable();
  }

  onLectureTypeSelect(lectureTypeNameSelection: boolean) {
    this.searchClassesGroupsForm.patchValue({
      isLectureTypeNameTheory: lectureTypeNameSelection
    });
    this.onSearchLecturesFormSubmit();
  }

  selectCourseSchedule() {
    this.courseScheduleSelectDialogService.selectCourseSchedule(this.searchClassesGroupsForm.value.courseSchedule);
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
    this.dataSource.loadClassesGroups(
        this.currentUserId,
        null,
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
      this.loadClassesGroupsPage();
    } else {
      this.clearInput();
    }
    this.classGroupService.classGroupTableLoadedSubject.next(true);
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

  simpleCheck(row: any): boolean {
    let result: boolean = false;
    if (this.selectedRow !== null) {
      result = this.selectedRow.id === row.id;
    }
    if (!result) {
      //this.selection.deselect(row);
      if (this.selectedRow?.groupType.name !== row.groupType.name) {
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

  selectHandler(row: ClassGroup) {
    let result: boolean = false;
    console.log("Select Handler:");
    this.selection.toggle(row);
    if (this.selectedRow !== null) {
      result = this.selectedRow.id === row.id;
    }
    if (this.selection.isSelected(row)) {
      if(!result) {
        this.selectedRow = row;
        console.log("New selection: "+row.courseSchedule.course.name+", "+row.nameIdentifier);
        console.log("capacity: "+JSON.stringify(row));
        //this.check(row);
        if (this.currentUser) {
          this.createGroupStudent(this.createGroupStudentData(this.selectedRow, this.currentUser.id));
        }
        console.log("Data pushed! "+this.selectedRow.courseSchedule.course.name+", "+this.selectedRow.nameIdentifier);
      }
    } else {
        if (this.selectedRow && this.currentUser) {
          this.deleteGroupStudent(this.selectedRow.id, this.currentUser.id, row);
        }

        console.log("Data removed! "+this.selectedRow);
    }
  }

  unCheck(data: any) {
    if (this.selectedRow !== null) {
      if (data.id === this.selectedRow.id) {
        console.log("Still exists ..."+data.courseSchedule.course.name+", "+data.nameIdentifier);
      }
      console.log("DELETE");
      if (data.id === this.selectedRow.id) {
        this.selectedRow = null;
      }
    }
  }

  createGroupStudentData(classGroup: ClassGroup, studentId: number): GroupStudentRequestData {
    const groupStudentData : GroupStudentRequestData = {
      classGroup: classGroup,
      studentId: studentId
    };
    return groupStudentData;
  }

  private createGroupStudent(groupStudentData: GroupStudentRequestData) {
    this.createGroupStudentSubscription = this.groupStudentService.createGroupStudent(groupStudentData, this.currentUserId)
    .pipe(last())
    .subscribe(() => {
      console.log("DATA: "+ "Entered sto subscribe");
        this.snackbarService.success('You just subscribed to '+this.selectedLectureTypeName.toLowerCase()+'_'+this.selectedRow?.nameIdentifier);
        this.router.navigate(['/classes-groups'], { relativeTo: this.route});
      }).add(() => { this.isLoading = false; });
  }

  deleteGroupStudent(classGroupId: number, studentId: number, row: ClassGroup) {
    console.log("Hallo "+this.ensureDialogStatus);
    this.groupStudentService.deleteGroupStudentByClassGroupIdAndStudentId(classGroupId, studentId, this.currentUserId)
        .pipe(first())
        .subscribe(() => {
          //this.groupStudent.isDeleting = false;
          this.snackbarService.success('You just unsubscribed from '+this.selectedLectureTypeName.toLowerCase()+'_'+this.selectedRow?.nameIdentifier);
          this.unCheck(row);
          this.router.navigate(['/classes-groups'], { relativeTo: this.route});
        });
  }
  
  ngOnDestroy(): void {
    if (this.departmentIdFormControlChangedSubscription) {
      this.departmentIdFormControlChangedSubscription.unsubscribe();
    }
    if (this.groupStudentSubscription) {
      this.groupStudentSubscription.unsubscribe();
    }
    if (this.ensureDialogSubscription) {
      this.ensureDialogSubscription.unsubscribe();
    }
    if (this.createGroupStudentSubscription) {
      this.createGroupStudentSubscription.unsubscribe();
    }
    if (this.courseScheduleSelectDialogSubscription) {
      this.courseScheduleSelectDialogSubscription.unsubscribe();
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
 }
 
}