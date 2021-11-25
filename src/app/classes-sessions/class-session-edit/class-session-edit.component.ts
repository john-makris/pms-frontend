import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { first, last } from 'rxjs/operators';
import { ClassGroupService } from 'src/app/classes-groups/class-group.service';
import { ClassGroupResponseData } from 'src/app/classes-groups/common/payload/response/classGroupResponseData.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { LectureResponseData } from 'src/app/lectures/common/payload/response/lectureResponseData.interface';
import { LectureService } from 'src/app/lectures/lecture.service';
import { ClassSessionService } from '../class-session.service';
import { ClassSessionRequestData } from '../common/payload/request/classSessionRequestData.interface';

@Component({
  selector: 'app-class-session-edit',
  templateUrl: './class-session-edit.component.html',
  styleUrls: ['./class-session-edit.component.css']
})
export class ClassSessionEditComponent implements OnInit, OnDestroy {
  datePickerFilter = (d: Date | null): boolean => {
    const date = (d || new Date()).getDate();
    const day = (d || new Date()).getDay();
    const month = (d || new Date()).getMonth();
    const year = (d || new Date()).getFullYear();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6 && (d && (d.getMonth() === new Date().getMonth()) ? date >= new Date().getDate() : true)
    && (d && (d.getFullYear() === new Date().getFullYear()) ? month >= new Date().getMonth() : true)
    && year >= new Date().getFullYear() && year <= new Date().getFullYear() + 1
  };

  classSessionForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;

  isClassSessionActive: boolean = false;

  selectedGroupNumber: string = '';
  currentStudentsOfGroup: number = 0;

  delimeter: string = ',' + '\xa0';
  panelOpenState = false;

  selectedFiles!: FileList | undefined;
  currentFile!: File | undefined;

  state: boolean = false;

  currentLecture: LectureResponseData | null = null;
  currentClassGroup: ClassGroupResponseData | null = null;

  selectedDate: string = '';


  @ViewChild('input') input!: ElementRef;
  @ViewChild(MatSelect) select!: MatSelect;

  classSessionFormChangesSubscription!: Subscription;
  lectureTypeSubscription!: Subscription;
  identifierSuffixesSubscription!: Subscription;
  roomSubscription!: Subscription;
  courseScheduleSelectDialogSubscription!: Subscription;
  routeSubscription!: Subscription;
  departmentIdSubscription!: Subscription;
  classGroupSubscription!: Subscription;
  createClassSessionSubscription!: Subscription;
  updateClassSessionSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lectureService: LectureService,
    private classGroupService: ClassGroupService,
    private classSessionService: ClassSessionService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {

    console.log("BEFORE FORM INITIALIZATION: ");
    this.classSessionForm = this.formBuilder.group({
      identifierSuffix: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      date: ['', Validators.required],
      timeSpan: [''],
      presence_statement: [false, Validators.required]
    });
    
    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.classGroupSubscription = this.classSessionService.getClassSessionById(this.id)
              .pipe(first())
              .subscribe((currentClassSessionData: any) => {
                if (currentClassSessionData !== null) {
                  this.currentClassGroup = currentClassSessionData;
                  //this.departmentService.departmentIdSubject.next(this.currentClassGroup.courseSchedule.course.department.id);
                  this.classSessionForm.patchValue({
                    identifierSuffix: currentClassSessionData.identifierSuffix,
                    date: new Date(currentClassSessionData.date),
                    timeSpan: currentClassSessionData.classGroup?.startTime+" - "+currentClassSessionData.classGroup?.endTime,
                    presence_statement: currentClassSessionData.presenceStatementStatus
                  });
                  this.currentLecture = currentClassSessionData.lecture;
                  this.currentClassGroup = currentClassSessionData.classGroup;

                  //this.setSelectedValue(this.selectedLectureType, this.select.value);
                  console.log("Selected Lecture: "+ JSON.stringify(this.currentLecture));
                  console.log("Selected Class Group: "+ JSON.stringify(this.currentClassGroup));
                } else {
                  this.onCancel();
                }
              });
          } else {
            this.lectureService.lectureState.
            pipe(first())
            .subscribe((_lecture: LectureResponseData | null) => {
              if (_lecture !== null) {
                this.currentLecture = _lecture;
                console.log("Subscribed Lecture: "+JSON.stringify(_lecture));
              } else {
                this.onCancel();
              }
            });
        
            this.classGroupService.classGroupState.
            pipe(first())
            .subscribe((_classGroup: ClassGroupResponseData | null) => {
              if (_classGroup !== null) {
                this.currentClassGroup = _classGroup;
                console.log("Subscribed Class Group: "+JSON.stringify(_classGroup));
              } else {
                this.onCancel();
              }
            });
          }
        }
      );

      this.classSessionFormChangesSubscription = this.classSessionForm.controls.date.valueChanges.subscribe((date: Date) => {
        this.selectedDate = moment(date).format("YYYY-MM-DD");
        if (this.classSessionForm.controls.timeSpan.value === '') {
          this.classSessionForm.patchValue({
            timeSpan: this.currentClassGroup?.startTime+" - "+this.currentClassGroup?.endTime
          });
        }
        console.log("Start Date: "+this.selectedDate);
        console.log("Date object: "+JSON.stringify(date));
        //this.endTimeCalculator();
      });

  }

  get f() { return this.classSessionForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.classSessionForm.invalid) {
      return;
    }

    this.isLoading = true;

    if (this.currentLecture && this.currentClassGroup) {
      const classSessionData: ClassSessionRequestData = {
        identifierSuffix: this.classSessionForm.value.identifierSuffix,
        date: this.selectedDate,
        presenceStatementStatus: this.classSessionForm.value.presence_statement,
        lecture: this.currentLecture,
        classGroup: this.currentClassGroup
      };

      console.log("Class Session Request Data: ");
      console.log("Lecture: "+JSON.stringify(this.currentLecture));
      console.log("Class Group: "+JSON.stringify(this.currentClassGroup));
      console.log("Identifier Suffix: "+this.classSessionForm.value.identifierSuffix);
      console.log("Date: "+this.selectedDate);
      console.log("Presence Statement: "+this.classSessionForm.value.presence_statement);
      //this.courseScheduleForm.reset();
      
      if (this.isAddMode) {
        this.createClassGroup(classSessionData);
      } else {
        this.updateClassGroup(classSessionData);
      }
    }
  }

  private createClassGroup(classSessionData: ClassSessionRequestData) {
    this.createClassSessionSubscription = this.classSessionService.createClassSession(classSessionData)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success('Class Session added');
          this.router.navigate(['../'], { relativeTo: this.route });
      }).add(() => { this.isLoading = false; });
  }

  private updateClassGroup(classSessionData: ClassSessionRequestData) {
    this.updateClassSessionSubscription = this.classSessionService.updateClassSession(this.id, classSessionData)
      .pipe(last())
      .subscribe(() => {
        this.snackbarService.success('Class Session updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      }).add(() => this.isLoading = false);
  }

  onCancel() {
    this.router.navigate(['/classes-sessions'], { relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.departmentIdSubscription) {
      this.departmentIdSubscription.unsubscribe();
    }
    if (this.classGroupSubscription) {
      this.classGroupSubscription.unsubscribe();
    }
    if (this.courseScheduleSelectDialogSubscription) {
      this.courseScheduleSelectDialogSubscription.unsubscribe();
    }
    if (this.createClassSessionSubscription) {
      this.createClassSessionSubscription.unsubscribe();
    }
    if (this.updateClassSessionSubscription) {
      this.updateClassSessionSubscription.unsubscribe();
    }
    if (this.classSessionFormChangesSubscription) {
      this.classSessionFormChangesSubscription.unsubscribe();
    }
  }

}