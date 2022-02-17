import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { ClassGroupService } from 'src/app/classes-groups/class-group.service';
import { ClassGroupResponseData } from 'src/app/classes-groups/common/payload/response/classGroupResponseData.interface';
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
import { StudentsOfGroupDataSource } from '../common/tableDataHelper/students-of-group.datasource';
import { GroupStudentService } from '../group-student.service';
import { ClassGroupSelectDialogService } from './services/class-group-select-dialog.service';

@Component({
  selector: 'app-group-student-list',
  templateUrl: './group-student-list.component.html',
  styleUrls: ['./group-student-list.component.css']
})
export class GroupStudentListComponent implements OnInit, OnDestroy {
  searchStudentsOfGroupsForm!: FormGroup;

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  isLoading: boolean = false;
  submitted: boolean = false;

  dataSource!: StudentsOfGroupDataSource;
  departments!: Department[];
  selectedDepartmentId: string = '';

  selectedClassGroupId: string = '';
  selectedClassGroup: ClassGroupResponseData | null = null;

  selectedCourseScheduleId: string = '';
  selectedCourseSchedule: CourseSchedule | null = null;

  selectedLectureTypeName: string = 'Theory';
  lectureTypes: LectureType[] = [];
  identifierSuffixList: Array<string> = [];

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';
  currentActivityState: string = '';

  departmentIdFormControlChangedSubscription!: Subscription;
  classGroupSelectDialogSubscription!: Subscription;
  courseScheduleSelectDialogSubscription!: Subscription;
  lectureTypeSubscription!: Subscription;
  snackbarSubscription!: Subscription;
  pageDetailSubscription!: Subscription;
  departmentsSubscription!: Subscription;

  displayedColumns = [
    'id',
    'username',
    'firstname',
    'lastname'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private classGroupService: ClassGroupService,
    private lectureTypeService: LectureTypeService,
    private courseScheduleService: CourseScheduleService,
    private courseScheduleSelectDialogService: CourseScheduleSelectDialogService,
    private classGroupSelectDialogService: ClassGroupSelectDialogService,
    private snackbarService: SnackbarService,
    private departmentService: DepartmentService,
    private groupStudentService: GroupStudentService,
    private authService: AuthService) {}

    ngOnInit(): void {

      this.authService.user.subscribe((user: AuthUser | null) => {
        if (user) {
          this.currentUser = user;
          this.currentUserId = this.currentUser.id;
          console.log("Current User Id: "+this.currentUserId);
  
          this.showAdminFeatures = this.currentUser.roles.includes('ROLE_ADMIN');
          this.showTeacherFeatures = this.currentUser.roles.includes('ROLE_TEACHER');
  
          if (this.showTeacherFeatures && !this.showAdminFeatures) {
            this.selectedDepartmentId = this.currentUser.department.id.toString();
            console.log("Teachers department: "+this.selectedDepartmentId);
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
  
      if (this.showAdminFeatures) {
        this.departmentsSubscription = this.departmentService.getAllDepartments()
        .pipe(first())
        .subscribe(departments => {
          this.departments = departments;
        });
      }
  
      this.searchStudentsOfGroupsForm = this.formBuilder.group({
        departmentId: [this.selectedDepartmentId],
        courseSchedule: [''],
        isLectureTypeNameTheory : [true],
        classGroup: ['']
      });
  
      console.log("DEPARTMENT ID: "+this.selectedDepartmentId);
  
      this.departmentService.departmentIdSubject.next(+this.selectedDepartmentId);
  
      this.dataSource = new StudentsOfGroupDataSource(this.groupStudentService);
  
      if (+this.searchStudentsOfGroupsForm.value.departmentId && +this.selectedCourseScheduleId && this.selectedClassGroupId) {
        this.dataSource.loadStudentsOfGroup(this.currentUserId, +this.selectedClassGroupId, '', 0, 3, 'asc', this.currentColumnDef);
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
          this.searchStudentsOfGroupsForm.patchValue({
            courseSchedule: _courseSchedule
          });
          this.selectedCourseSchedule = _courseSchedule;
          this.selectedCourseScheduleId = _courseSchedule.id.toString();
          this.searchStudentsOfGroupsForm.patchValue({
            isLectureTypeNameTheory: true
          });
          this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
          this.onLectureTypeSelect(true);
        }
      });

      this.classGroupSelectDialogSubscription = this.classGroupSelectDialogService.classGroupSelectDialogState
      .subscribe((_classGroup: ClassGroupResponseData | null) => {
        console.log("Class Group Data: "+JSON.stringify(_classGroup));
        if (_classGroup !== null) {
          console.log("CATCH CLASS GROUP: "+_classGroup.nameIdentifier);
          this.searchStudentsOfGroupsForm.patchValue({
            classGroup: _classGroup
          });
          this.selectedClassGroup = _classGroup;
          this.selectedClassGroupId = _classGroup.id.toString();

          this.classGroupService.classGroupSubject.next(this.selectedClassGroup);
          this.onSearchStudentsOfGroupFormSubmit();
        }
      });

      this.departmentIdFormControlChangedSubscription = this.searchStudentsOfGroupsForm.controls.departmentId.valueChanges
      .subscribe((departmentId: string) => {
        console.log("Group Student Search departmentId value: "+(+departmentId));
        this.departmentService.departmentIdSubject.next(+departmentId);
      });

    }
  
    get slf() { return this.searchStudentsOfGroupsForm.controls; }
  
    checkForCourseScheduleAndGroupValue() {
      if (this.searchStudentsOfGroupsForm.value.courseSchedule) {
        this.clearFormValues();
      }
    }

    checkForGroupValue() {
      if (this.searchStudentsOfGroupsForm.value.classGroup) {
        this.clearClassGroupValue();
      }
    }
  
    onSearchStudentsOfGroupFormSubmit() {
      this.router.navigate(['/students-of-groups'], { relativeTo: this.route });
      this.submitted = true;

      if(this.searchStudentsOfGroupsForm.invalid) {
        return;
      }
  
      this.isLoading = true;

      this.paginator.pageIndex = 0;
      this.sort.direction='asc'
  
      this.refreshTable();
    }
  
    selectCourseSchedule() {
      this.courseScheduleSelectDialogService.selectCourseSchedule(this.searchStudentsOfGroupsForm.value.courseSchedule);
    }

    onLectureTypeSelect(lectureTypeNameSelection: boolean) {
      this.searchStudentsOfGroupsForm.patchValue({
        isLectureTypeNameTheory: lectureTypeNameSelection
      });
      this.selectedLectureTypeModerator();
      this.publishLectureType();
      this.checkForGroupValue();
      this.refreshTable();
    }

    selectClassGroup() {
      this.classGroupSelectDialogService.selectClassGroup(this.searchStudentsOfGroupsForm.value.classGroup);
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
  
                  this.loadStudentsOfGroupPage();
              })
          )
          .subscribe();
  
      merge(this.sort.sortChange, this.paginator.page)
      .pipe(
          tap(() => this.loadStudentsOfGroupPage())
      )
      .subscribe();
    }
  
    loadStudentsOfGroupPage() {
      this.dataSource.loadStudentsOfGroup(
          this.currentUserId,
          +this.selectedClassGroupId,
          this.input.nativeElement.value,
          this.paginator.pageIndex,
          this.paginator.pageSize,
          this.sort.direction,
          this.currentColumnDef);
    }
    
    refreshTable() {
      //console.log("INPUT VALUE: "+this.input.nativeElement.value);
      if (this.input.nativeElement.value === '') {
        this.loadStudentsOfGroupPage();
      } else {
        this.clearInput();
      }
      this.groupStudentService.groupStudentTableLoadedSubject.next(true);
    }
  
    selectedLectureTypeModerator() {
      this.selectedLectureTypeName = this.searchStudentsOfGroupsForm.value.isLectureTypeNameTheory ? 'Theory' : 'Lab';
    }
  
    clearInput() {
      this.input.nativeElement.value='';
      this.loadStudentsOfGroupPage();
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

    clearFormValues() {
      this.searchStudentsOfGroupsForm.patchValue({
        courseSchedule: '',
        isLectureTypeNameTheory: true
      });
      this.selectedCourseSchedule = null;
      this.selectedCourseScheduleId = '';
      this.selectedLectureTypeName = 'Theory';

      this.courseScheduleService.courseScheduleSubject.next(this.selectedCourseSchedule);
      this.clearClassGroupValue();
      this.router.navigate(['/students-of-groups'], { relativeTo: this.route});
      this.refreshTable();
    }

    clearClassGroupValue() {
      this.selectedClassGroup = null;
      this.selectedClassGroupId = '';
      this.classGroupService.classGroupSubject.next(this.selectedClassGroup);
    }

    clearClassGroupAndRefresh() {
      this.clearClassGroupValue();
      this.refreshTable();
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
      if (this.classGroupSelectDialogSubscription) {
        this.classGroupSelectDialogSubscription.unsubscribe();
      }
      if (this.courseScheduleSelectDialogSubscription) {
        this.courseScheduleSelectDialogSubscription.unsubscribe();
      }
   }

}
