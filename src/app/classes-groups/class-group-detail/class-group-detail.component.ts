import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { ClassGroupService } from '../class-group.service';
import { ClassGroupResponseData } from '../common/payload/response/classGroupResponseData.interface';

@Component({
  selector: 'app-class-group-detail',
  templateUrl: './class-group-detail.component.html',
  styleUrls: ['./class-group-detail.component.css']
})
export class ClassGroupDetailComponent implements OnInit, OnDestroy {
  id!: number;
  classGroup!: ClassGroupResponseData;
  private ensureDialogSubscription!: Subscription;
  ensureDialogStatus!: boolean;
  classGroupTable: boolean = false;

  classGroupTableLoadedSubscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private classGroupService: ClassGroupService,
    private snackbarService: SnackbarService,
    private ensureDialogService: EnsureDialogService) { }

  ngOnInit(): void {
    this.classGroupTableLoadedSubscription = this.classGroupService.classGroupTableLoadedState
    .subscribe((tableStatus: boolean) => {
      if (tableStatus) {
        this.classGroupTable = tableStatus;
      } else {
        this.router.navigate(['/classes-groups'], { relativeTo: this.route});
      }
    });

    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.classGroupService.getClassGroupById(this.id)
          .pipe(first())
          .subscribe((currentClassGroup: ClassGroupResponseData) => {
            this.classGroup = currentClassGroup;
            console.log("Class Group Details: "+JSON.stringify(this.classGroup));
          });
      }
    );
  }

  editClassGroup() {
    this.router.navigate(['/classes-groups/edit/', this.id], { relativeTo: this.route });
  }
  
  deleteClassGroup(id: number) {
    let groupType: string = '';
    if (this.classGroup.groupType.name === 'Theory') {
      groupType = 'theories';
    } else {
      groupType = 'tabs';
    }

    if (!this.classGroup) return;
    this.ensureDialogService.openDialog('will be Deleted', this.classGroup.nameIdentifier+' for '+this.classGroup.courseSchedule.course.name+' '
    +groupType);
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            //this.classGroup.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.classGroupService.deleteClassGroupById(id)
                .pipe(first())
                .subscribe(() => {
                  //this.classGroup.isDeleting = false;
                  this.snackbarService.success('Class Group deleted');
                  this.router.navigate(['../../'], { relativeTo: this.route });
                });
          }
        }
      );
  }
  
  onCancel() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    if(this.ensureDialogSubscription) {
      this.ensureDialogSubscription.unsubscribe();
    }
    if(this.classGroupTableLoadedSubscription) {
      this.classGroupTableLoadedSubscription.unsubscribe();
    }
  }
}