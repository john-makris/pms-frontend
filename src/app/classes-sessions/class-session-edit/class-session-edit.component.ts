import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { first, last } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { ClassGroup } from 'src/app/classes-groups/class-group.model';
import { ClassGroupResponseData } from 'src/app/classes-groups/common/payload/response/classGroupResponseData.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { ClassGroupSelectDialogService } from 'src/app/groups-students/group-student-list/services/class-group-select-dialog.service';
import { LectureResponseData } from 'src/app/lectures/common/payload/response/lectureResponseData.interface';
import { LectureService } from 'src/app/lectures/lecture.service';
import { ManagePresencesRequestData } from 'src/app/presences/common/payload/request/managePresencesRequestData.interface';
import { PresenceService } from 'src/app/presences/presence.service';
import { AuthUser } from 'src/app/users/auth-user.model';
import { ClassSession } from '../class-session.model';
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

  currentUser: AuthUser | null = null;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  isClassSessionActive: boolean = false;

  selectedGroupNumber: string = '';
  currentStudentsOfGroup: number = 0;

  delimeter: string = ',' + '\xa0';
  panelOpenState = false;

  selectedFiles!: FileList | undefined;
  currentFile!: File | undefined;

  tableLoaded: boolean = false;

  presenceStatementChanged: boolean = false;

  currentPresenceStatementStatus: boolean = false;
  currentClassSessionStatus: string = '';
  currentClassSession: ClassSession | null = null;
  currentLecture: LectureResponseData | null = null;
  currentClassGroup: ClassGroupResponseData | null = null;
  selectedDate: string = '';


  @ViewChild('input') input!: ElementRef;
  @ViewChild(MatSelect) select!: MatSelect;

  updateClassSessionPresencesSubscription!: Subscription;
  createClassSessionPresencesSubscription!: Subscription;
  lectureSubscription!: Subscription;
  tableLoadedStateSubscription!: Subscription;
  classGroupSelectDialogSubscription!: Subscription;
  classSessionFormDateChangesSubscription!: Subscription;
  roomSubscription!: Subscription;
  routeSubscription!: Subscription;
  classSessionSubscription!: Subscription;
  createClassSessionSubscription!: Subscription;
  updateClassSessionSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private presenceService: PresenceService,
    private lectureService: LectureService,
    private classGroupSelectDialogService: ClassGroupSelectDialogService,
    private classSessionService: ClassSessionService,
    private snackbarService: SnackbarService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.showAdminFeatures = this.currentUser.roles.includes('ADMIN');
        this.showTeacherFeatures = this.currentUser.roles.includes('TEACHER');
        this.showStudentFeatures = false;
        // this.currentUser.roles.includes('STUDENT');
      }
    });

    console.log("BEFORE FORM INITIALIZATION: ");
    this.classSessionForm = this.formBuilder.group({
      classGroup: ['', Validators.required],
      identifierSuffix: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      date: ['', Validators.required],
      timeSpan: [''],
      presence_statement: [this.currentPresenceStatementStatus, Validators.required]
    });

    this.tableLoadedStateSubscription = this.classSessionService.classSessionTableLoadedState
    .subscribe((loaded: boolean) => {
      if (loaded) {
        this.tableLoaded = loaded;
      } else {
        this.tableLoaded = false;
        this.onCancel();
      }
    });
    
    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            if (this.showStudentFeatures) {
              this.router.navigate(['../../'], { relativeTo: this.route });
            }
            this.classSessionSubscription = this.classSessionService.getClassSessionById(this.id)
              .pipe(first())
              .subscribe((currentClassSessionData: any) => {
                if (currentClassSessionData !== null) {
                  //this.currentClassGroup = currentClassSessionData;
                  //this.departmentService.departmentIdSubject.next(this.currentClassGroup.courseSchedule.course.department.id);
                  this.classSessionForm.patchValue({
                    classGroup: currentClassSessionData.classGroup,
                    identifierSuffix: currentClassSessionData.identifierSuffix,
                    date: new Date(currentClassSessionData.date),
                    timeSpan: currentClassSessionData.classGroup?.startTime+" - "+currentClassSessionData.classGroup?.endTime,
                    presence_statement: currentClassSessionData.presenceStatementStatus
                  });
                  this.createFormattedDate(new Date(currentClassSessionData.date));
                  this.currentLecture = currentClassSessionData.lecture;
                  this.currentClassGroup = currentClassSessionData.classGroup;
                  this.currentClassSession = currentClassSessionData;
                  this.currentPresenceStatementStatus = currentClassSessionData.presenceStatementStatus;
                  if (currentClassSessionData.status) {
                    this.currentClassSessionStatus = 'active';
                  } else if (currentClassSessionData.status === false) {
                    this.currentClassSessionStatus = 'inactive';
                  } else {
                    this.currentClassSessionStatus = 'pending';
                  }
                  //this.setSelectedValue(this.selectedLectureType, this.select.value);
                  console.log("Selected Lecture: "+ JSON.stringify(this.currentLecture));
                  console.log("Selected Class Group: "+ JSON.stringify(this.currentClassGroup));
                } else {
                  this.onCancel();
                }
              });
          } else {
            this.lectureSubscription = this.lectureService.lectureState.
            pipe(first())
            .subscribe((_lecture: LectureResponseData | null) => {
              if (_lecture !== null) {
                this.currentLecture = _lecture;
                console.log("Subscribed Lecture: "+JSON.stringify(_lecture));
              } else {
                this.onCancel();
              }
            });

            this.classGroupSelectDialogSubscription = this.classGroupSelectDialogService.classGroupSelectDialogState
            .subscribe((_classGroup: ClassGroupResponseData | null) => {
              this.classSessionForm.controls.classGroup.markAsTouched();
              console.log("Class Group Data: "+JSON.stringify(_classGroup));
              if (_classGroup !== null) {
                console.log("CATCH Class Group: "+_classGroup.nameIdentifier);
                this.classSessionForm.patchValue({
                  classGroup: _classGroup
                });
                this.currentClassGroup = _classGroup;
                if (this.classSessionForm.controls.date.valid) {
                  this.timeSpanModerator(_classGroup, this.classSessionForm.controls.date.value);
                }
              } else {
                if (!this.currentClassGroup) {
                  this.f.classGroup.setErrors({
                    'required': true
                  });
                }
              }
            });

          }
        }
      );

      this.classSessionFormDateChangesSubscription = this.classSessionForm.controls.date.valueChanges.subscribe((date: Date) => {
        if (this.currentClassGroup && date) {
          this.timeSpanModerator(this.currentClassGroup, date);
        }
      });

      this.classSessionFormDateChangesSubscription = this.classSessionForm.controls.presence_statement.valueChanges
      .subscribe((presenceStatementStatus: boolean) => {
        console.log("Presence statememt status: "+presenceStatementStatus);
        if (this.currentClassSession) {
          this.presenceStatementChanged = true;
          console.log("Presence statement changed: "+this.presenceStatementChanged);
          this.currentPresenceStatementStatus = presenceStatementStatus;
          this.onSubmit();
        }
      });

  }

  get f() { return this.classSessionForm.controls; }

  timeSpanModerator(classGroup: ClassGroup, date: Date) {
    this.createFormattedDate(date);
    if (this.classSessionForm.controls.timeSpan.value === '' || this.classSessionForm.controls.timeSpan.valid) {
      this.classSessionForm.patchValue({
        timeSpan: classGroup?.startTime+" - "+classGroup?.endTime
      });
    }
    console.log("Start Date: "+this.selectedDate);
    console.log("Date object: "+JSON.stringify(date));
  }

  createFormattedDate(date: Date) {
    this.selectedDate = moment(date).format("YYYY-MM-DD");
  }

  selectClassGroup() {
    this.classGroupSelectDialogService.selectClassGroup(this.classSessionForm.value.classGroup);
  }

  checkForClassGroupValue() {
    if (this.classSessionForm.value.classGroup) {
      this.clearClassGroupValue();
    }
  }

  clearClassGroupValue() {
    this.classSessionForm.patchValue({
      classGroup: ''
    });

    this.currentClassGroup = null;
  }

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
        presenceStatementStatus: this.currentPresenceStatementStatus,
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
        this.createClassSession(classSessionData);
      } else {
        this.updateClassSession(classSessionData);
      }
    }
  }

  private createClassSessionPresences(managePresencesRequestData: ManagePresencesRequestData) {
    this.createClassSessionPresencesSubscription = this.presenceService.createPresences(managePresencesRequestData)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success(this.currentClassSession?.nameIdentifier+' presence statement opened');
          this.router.navigate(['../../'], { relativeTo: this.route });
      }).add(() => { this.isLoading = false; });
  }

  private updateClassSessionPresences(managePresencesRequestData: ManagePresencesRequestData) {
    this.updateClassSessionPresencesSubscription = this.presenceService.updatePresences(managePresencesRequestData)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success(this.currentClassSession?.nameIdentifier+' presence statement closed');
          this.router.navigate(['../../'], { relativeTo: this.route });
      }).add(() => { this.isLoading = false; });
  }

  private createClassSession(classSessionData: ClassSessionRequestData) {
    this.createClassSessionSubscription = this.classSessionService.createClassSession(classSessionData)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success('Class Session added');
          this.router.navigate(['../'], { relativeTo: this.route });
      }).add(() => { this.isLoading = false; });
  }

  private updateClassSession(classSessionData: ClassSessionRequestData) {
    this.updateClassSessionSubscription = this.classSessionService.updateClassSession(this.id, classSessionData)
      .pipe(last())
      .subscribe(() => {
        if (this.currentClassSessionStatus === 'pending') {
          this.snackbarService.success('Class Session updated');
          this.router.navigate(['../../'], { relativeTo: this.route});
        }
        if (this.presenceStatementChanged) {
          const managePresenceRequestData: ManagePresencesRequestData = {
            classSessionId: this.id
          };
          if (classSessionData.presenceStatementStatus === true) {
            this.createClassSessionPresences(managePresenceRequestData);
          } else {
            console.log("PRESENCE STATUS IS FALSE");
            this.updateClassSessionPresences(managePresenceRequestData);
          }
        }
      }).add(() => this.isLoading = false);
  }

  onCancel() {
    this.router.navigate(['/classes-sessions'], { relativeTo: this.route});
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.classSessionSubscription) {
      this.classSessionSubscription.unsubscribe();
    }
    if (this.createClassSessionSubscription) {
      this.createClassSessionSubscription.unsubscribe();
    }
    if (this.updateClassSessionSubscription) {
      this.updateClassSessionSubscription.unsubscribe();
    }
    if (this.classSessionFormDateChangesSubscription) {
      this.classSessionFormDateChangesSubscription.unsubscribe();
    }
    if (this.lectureSubscription) {
      this.lectureSubscription.unsubscribe();
    }
    if (this.classGroupSelectDialogSubscription) {
      this.classGroupSelectDialogSubscription.unsubscribe();
    }
    if (this.tableLoadedStateSubscription) {
      this.tableLoadedStateSubscription.unsubscribe();
    }
  }

}