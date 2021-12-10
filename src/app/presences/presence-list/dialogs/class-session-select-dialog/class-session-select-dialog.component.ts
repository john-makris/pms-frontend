import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { ClassGroupService } from 'src/app/classes-groups/class-group.service';
import { ClassSession } from 'src/app/classes-sessions/class-session.model';
import { ClassSessionService } from 'src/app/classes-sessions/class-session.service';
import { ClassesSessionsDataSource } from 'src/app/classes-sessions/common/tableDataHelper/classes-sessions.datasource';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { LectureTypeService } from 'src/app/lectures/lecture-types/lecture-type.service';
import { Lecture } from 'src/app/lectures/lecture.model';
import { LectureService } from 'src/app/lectures/lecture.service';

@Component({
  selector: 'app-class-session-select-dialog',
  templateUrl: './class-session-select-dialog.component.html',
  styleUrls: ['./class-session-select-dialog.component.css']
})
export class ClassSessionSelectDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  
  dialogStarted: boolean = true;
  dataSource!: ClassesSessionsDataSource;

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';

  selectedRowId: number = -1;
  isRowSelected: boolean = false;
  selectedClassSession!: ClassSession | null;

  currentLectureId: number = 0;

  lectureSubscription!: Subscription;
  pageDetailSubscription!: Subscription;

  displayedColumns = [
    'nameIdentifier',
    'date',
    'classGroup'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  selection = new SelectionModel<ClassSession>(false, []);

  constructor(
    private lectureService: LectureService,
    private classSessionService: ClassSessionService,
    private dialogRef: MatDialogRef<ClassSessionSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data :{classSession: ClassSession}) {}


  ngOnInit(): void {

    this.dataSource = new ClassesSessionsDataSource(this.classSessionService);

    this.lectureSubscription = this.lectureService.lectureState
      .subscribe((lecture: Lecture | null) => {
        if (lecture) {
          this.currentLectureId = lecture.id;
          console.log("Current Lecture Id: " + this.currentLectureId);
          this.dataSource.loadClassesSessions(this.currentLectureId, '',
            '', 0, 3, 'asc', this.currentColumnDef);
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
        this.currentLectureId,
        '',
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
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadClassesSessionsPage();
  }

  selectRow(selectedRow: ClassSession) {
    //console.log("Selected Row: "+ JSON.stringify(selectedRow));
    if (selectedRow.id == this.selectedRowId) {
      this.selection.deselect(selectedRow);
      this.selectedClassSession = null;
    } else {
      this.selection.toggle(selectedRow);
    }
    if(this.selection.isSelected(selectedRow)) {
      this.isRowSelected = true;
      this.selectedRowId = selectedRow.id;
      this.selectedClassSession = selectedRow;
      //console.log("Selected Course Schedule: "+JSON.stringify(this.selectedClassGroup));
    } else {
      this.isRowSelected = false;
      this.selectedRowId = -1;
    }
  }

  ok() {
    //console.log("DIALOG: "+JSON.stringify(this.selectedClassGroup));
    this.dialogRef.close(this.selectedClassSession);
  }

  close() {
      if (this.data.classSession.id) {
        //console.log("Close dialog: "+this.data.name);
        //console.log("DIALOG: "+JSON.stringify(this.data));
        this.dialogRef.close(this.data.classSession);
      } else {
        this.dialogRef.close(null);
      }
  }

  ngOnDestroy(): void {
    if (this.pageDetailSubscription) {
      this.pageDetailSubscription.unsubscribe();
    }
    if (this.lectureSubscription) {
      this.lectureSubscription.unsubscribe();
    }
  }

}