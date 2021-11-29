import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first, last } from 'rxjs/operators';
import { ClassSessionService } from 'src/app/classes-sessions/class-session.service';
import { ClassSessionResponseData } from 'src/app/classes-sessions/common/payload/response/classSessionResponseData.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { StudentSelectDialogService } from 'src/app/groups-students/group-student-edit/services/student-select-dialog.service';
import { UserResponseData } from 'src/app/users/common/payload/response/userResponseData.interface';
import { PresenceRequestData } from '../common/payload/request/presenceRequestData.interface';
import { PresenceService } from '../presence.service';

@Component({
  selector: 'app-presence-edit',
  templateUrl: './presence-edit.component.html',
  styleUrls: ['./presence-edit.component.css']
})
export class PresenceEditComponent implements  OnInit, OnDestroy {
  presenceForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;

  delimeter: string = ',' + '\xa0';
  panelOpenState = false;

  tableLoaded: boolean = false;

  currentStudent!: UserResponseData | null;
  currentClassSession: ClassSessionResponseData | null = null;

  @ViewChild('input') input!: ElementRef;
  @ViewChild(MatSelect) select!: MatSelect;

  classSessionSubscription!: Subscription;
  studentSelectDialogSubscription!: Subscription;
  tableLoadedStateSubscription!: Subscription;
  classGroupSelectDialogSubscription!: Subscription;
  classSessionFormDateChangesSubscription!: Subscription;
  roomSubscription!: Subscription;
  routeSubscription!: Subscription;
  presenceSubscription!: Subscription;
  createPresenceSubscription!: Subscription;
  updatePresenceSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private classSessionService: ClassSessionService,
    private presenceService: PresenceService,
    private studentSelectDialogService: StudentSelectDialogService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {

    console.log("BEFORE FORM INITIALIZATION: ");
    this.presenceForm = this.formBuilder.group({
      studentId: ['', Validators.required],
      status: [true, Validators.required]
    });

    this.tableLoadedStateSubscription = this.presenceService.presenceTableLoadedState
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
            this.presenceSubscription = this.presenceService.getPresenceById(this.id)
              .pipe(first())
              .subscribe((currentPresenceData: any) => {
                if (currentPresenceData !== null) {
                  this.presenceForm.patchValue({
                    studentId: currentPresenceData.student.id,
                    status: currentPresenceData.status
                  });
                  this.currentClassSession = currentPresenceData.classSession;
                  this.currentStudent = currentPresenceData.student;
                  console.log("Selected Class Session: "+ JSON.stringify(this.currentClassSession));
                } else {
                  this.onCancel();
                }
              });
          } else {
            this.classSessionSubscription = this.classSessionService.classSessionState
            .subscribe((_classSession: ClassSessionResponseData | null) => {
              if (_classSession) {
                console.log("Class Session: "+ JSON.stringify(_classSession));
                this.currentClassSession = _classSession;
              }
            });

            this.studentSelectDialogSubscription = this.studentSelectDialogService.studentSelectDialogState
            .subscribe((student: UserResponseData | null)=> {
              this.presenceForm.controls.studentId.markAsTouched();
              if (student) {
                this.presenceForm.patchValue({
                  studentId: student.id
                });
                this.currentStudent = student;
              } else {
                if (!this.currentStudent) {
                  this.f.studentId.setErrors({
                    'required': true
                  });
                }
              }
            });

          }
        }
      );

      /*
      this.classSessionFormDateChangesSubscription = this.presenceForm.controls.date.valueChanges.subscribe((date: Date) => {
        if (this.currentClassSession && date) {
          this.timeSpanModerator(this.currentClassSession, date);
        }
      });*/

  }

  get f() { return this.presenceForm.controls; }

  selectStudent() {
    this.studentSelectDialogService.selectStudent(this.currentClassSession);
  }

  checkForStudentIdValue() {
    if (this.presenceForm.value.studentId) {
      this.clearStudentValue();
    }
  }

  clearStudentValue() {
    this.presenceForm.patchValue({
      studentId: ''
    });

    this.currentStudent = null;
  }

  onSubmit() {
    this.submitted = true;

    if (this.presenceForm.invalid) {
      return;
    }

    this.isLoading = true;

    if (this.currentClassSession) {
      const presenceData: PresenceRequestData = {
        status: this.presenceForm.value.status,
        classSessionId: this.currentClassSession.id,
        studentId: this.presenceForm.value.studentId
      };

      console.log("Presence Request Data: ");
      console.log("Student Id: "+JSON.stringify(this.presenceForm.value.studentId));
      console.log("Class Session: "+JSON.stringify(this.currentClassSession));
      console.log("Status: "+this.presenceForm.value.status);
      //this.courseScheduleForm.reset();
      
      if (this.isAddMode) {
        this.createPresence(presenceData);
      } else {
        this.updatePresence(presenceData);
      }
    }
  }

  private createPresence(presenceData: PresenceRequestData) {
    this.createPresenceSubscription = this.presenceService.createPresence(presenceData)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success('Presence added');
          this.router.navigate(['../'], { relativeTo: this.route });
      }).add(() => { this.isLoading = false; });
  }

  private updatePresence(presenceData: PresenceRequestData) {
    this.updatePresenceSubscription = this.presenceService.updatePresence(this.id, presenceData)
      .pipe(last())
      .subscribe(() => {
        this.snackbarService.success('Presence updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      }).add(() => this.isLoading = false);
  }

  onCancel() {
    this.router.navigate(['/presences'], { relativeTo: this.route});
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.presenceSubscription) {
      this.presenceSubscription.unsubscribe();
    }
    if (this.createPresenceSubscription) {
      this.createPresenceSubscription.unsubscribe();
    }
    if (this.updatePresenceSubscription) {
      this.updatePresenceSubscription.unsubscribe();
    }
    if (this.classSessionFormDateChangesSubscription) {
      this.classSessionFormDateChangesSubscription.unsubscribe();
    }
    if (this.classGroupSelectDialogSubscription) {
      this.classGroupSelectDialogSubscription.unsubscribe();
    }
    if (this.tableLoadedStateSubscription) {
      this.tableLoadedStateSubscription.unsubscribe();
    }
  }

}