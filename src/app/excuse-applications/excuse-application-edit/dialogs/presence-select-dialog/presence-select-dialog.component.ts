import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { PresenceResponseData } from 'src/app/presences/common/payload/response/presenceResponseData.interface';
import { PresencesDataSource } from 'src/app/presences/common/tableDataHelper/presences.datasource';
import { PresenceService } from 'src/app/presences/presence.service';
import { PresenceSelectDialogData } from '../../data/presenceSelectDialogData.interface';

@Component({
  selector: 'app-presence-select-dialog',
  templateUrl: './presence-select-dialog.component.html',
  styleUrls: ['./presence-select-dialog.component.css']
})
export class PresenceSelectDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  
  dialogStarted: boolean = true;
  dataSource!: PresencesDataSource;

  currentNameIdentifier: string = '';

  totalItems: number = 0;
  currentPage: number = 0;
  currentPageItems: number = 0;
  currentColumnDef: string = 'id';

  selectedRowId: number = -1;
  isRowSelected: boolean = false;
  selectedPresence!: PresenceResponseData | null;

  currentUserId: number = 0;
  currentPresenceStatus: string = '';

  pageDetailSubscription!: Subscription;

  displayedColumns = [
    'course',
    'lecture'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  selection = new SelectionModel<PresenceResponseData>(false, []);

  constructor(
    private presenceService: PresenceService,
    private dialogRef: MatDialogRef<PresenceSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data :{object: PresenceSelectDialogData}) {}


  ngOnInit(): void {

    this.dataSource = new PresencesDataSource(this.presenceService);

    this.currentUserId = this.data.object.user.id;
    this.currentPresenceStatus = this.data.object.presenceStatus === null ? '' : this.data.object.presenceStatus.toString() ;
  
    this.dataSource.loadPresencesByUserIdAndStatus(this.currentUserId,
      this.currentPresenceStatus, '', 0, 3, 'asc', this.currentColumnDef);


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
      this.dataSource.loadPresencesByUserIdAndStatus(
        this.currentUserId,
        this.currentPresenceStatus,
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
  }

  clearInput() {
    this.input.nativeElement.value='';
    this.loadPresencesPage();
  }

  selectRow(selectedRow: PresenceResponseData) {
    //console.log("Selected Row: "+ JSON.stringify(selectedRow));
    if (selectedRow.id == this.selectedRowId) {
      this.selection.deselect(selectedRow);
      this.selectedPresence = null;
    } else {
      this.selection.toggle(selectedRow);
    }
    if(this.selection.isSelected(selectedRow)) {
      this.isRowSelected = true;
      this.selectedRowId = selectedRow.id;
      this.selectedPresence = selectedRow;
      //console.log("Selected Course Schedule: "+JSON.stringify(this.selectedClassGroup));
    } else {
      this.isRowSelected = false;
      this.selectedRowId = -1;
    }
  }

  ok() {
    //console.log("DIALOG: "+JSON.stringify(this.selectedClassGroup));
    this.dialogRef.close(this.selectedPresence);
  }

  close() {
    this.dialogRef.close(null);
  }

  ngOnDestroy(): void {
    if (this.pageDetailSubscription) {
      this.pageDetailSubscription.unsubscribe();
    }
  }
}