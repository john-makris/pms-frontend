import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { ClassGroup } from 'src/app/classes-groups/class-group.model';
import { ClassGroupService } from 'src/app/classes-groups/class-group.service';
import { ClassesGroupsDataSource } from 'src/app/classes-groups/common/tableDataHelper/classes-groups.datasource';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { LectureType } from 'src/app/lectures/lecture-types/lecture-type.model';
import { LectureTypeService } from 'src/app/lectures/lecture-types/lecture-type.service';

@Component({
  selector: 'app-class-group-select-dialog',
  templateUrl: './class-group-select-dialog.component.html',
  styleUrls: ['./class-group-select-dialog.component.css']
})
export class ClassGroupSelectDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  
  dialogStarted: boolean = true;
  dataSource!: ClassesGroupsDataSource;

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';

  selectedRowId: number = -1;
  isRowSelected: boolean = false;
  selectedClassGroup!: ClassGroup | null;

  currentLectureTypeName: string = '';
  currentCourseScheduleId: number = 0;

  lectureTypeSubscription!: Subscription;
  courseScheduleSubscription!: Subscription;
  pageDetailSubscription!: Subscription;

  displayedColumns = [
    'name',
    'startTime',
    'status'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  selection = new SelectionModel<ClassGroup>(false, []);

  constructor(
    private lectureTypeService: LectureTypeService,
    private courseScheduleService: CourseScheduleService,
    private classGroupService: ClassGroupService,
    private dialogRef: MatDialogRef<ClassGroupSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data :ClassGroup) {}


  ngOnInit(): void {

    this.dataSource = new ClassesGroupsDataSource(this.classGroupService);

    this.courseScheduleSubscription = this.courseScheduleService.courseScheduleState
      .subscribe((courseSchedule: CourseSchedule | null) => {
        if (courseSchedule) {
          this.currentCourseScheduleId = courseSchedule.id;
          console.log("Course Schedule Id: " + this.currentCourseScheduleId);
        }
    });

    this.lectureTypeSubscription = this.lectureTypeService.lectureTypeState
      .subscribe((lectureType: LectureType | null) => {
        if (lectureType) {
          this.currentLectureTypeName = lectureType.name;
          console.log("Lecture Type name: " + this.currentLectureTypeName);
          this.dataSource.loadClassesGroups(this.currentCourseScheduleId, 
            this.currentLectureTypeName, '', 0, 3, 'asc', this.currentColumnDef);
        }
    });

    this.pageDetailSubscription = this.dataSource.pageDetailState.pipe(
      switchMap(async (pageDetail: PageDetail) => {
        this.totalItems = pageDetail.totalItems;
        this.currentPageItems = pageDetail.currentPageItems;
        this.currentPage = pageDetail.currentPage;
        //console.log("Entered to SwitchMap");
      })
    ).subscribe();
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
        this.currentCourseScheduleId,
        this.currentLectureTypeName,
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
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadClassesGroupsPage();
  }

  selectRow(selectedRow: ClassGroup) {
    //console.log("Selected Row: "+ JSON.stringify(selectedRow));
    if (selectedRow.id == this.selectedRowId) {
      this.selection.deselect(selectedRow);
      this.selectedClassGroup = null;
    } else {
      this.selection.toggle(selectedRow);
    }
    if(this.selection.isSelected(selectedRow)) {
      this.isRowSelected = true;
      this.selectedRowId = selectedRow.id;
      this.selectedClassGroup = {
        id: selectedRow.id,
        nameIdentifier: selectedRow.nameIdentifier,
        startTime: selectedRow.startTime,
        endTime: selectedRow.endTime,
        capacity: selectedRow.capacity,
        groupType: selectedRow.groupType,
        status: selectedRow.status,
        room: selectedRow.room,
        courseSchedule: selectedRow.courseSchedule
      }
      //console.log("Selected Course Schedule: "+JSON.stringify(this.selectedClassGroup));
    } else {
      this.isRowSelected = false;
      this.selectedRowId = -1;
    }
  }

  ok() {
    //console.log("DIALOG: "+JSON.stringify(this.selectedClassGroup));
    this.dialogRef.close(this.selectedClassGroup);
  }

  close() {
      if (this.data.id) {
        //console.log("Close dialog: "+this.data.name);
        //console.log("DIALOG: "+JSON.stringify(this.data));
        this.dialogRef.close(this.data);
      } else {
        this.dialogRef.close(null);
      }
  }

  ngOnDestroy(): void {
    if (this.pageDetailSubscription) {
      this.pageDetailSubscription.unsubscribe();
    }
    if (this.courseScheduleSubscription) {
      this.courseScheduleSubscription.unsubscribe();
    }
    if (this.lectureTypeSubscription) {
      this.lectureTypeSubscription.unsubscribe();
    }
  }

}