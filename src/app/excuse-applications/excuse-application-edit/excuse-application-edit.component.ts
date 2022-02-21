import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first, last } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { EnsureDialogService } from 'src/app/common/dialogs/ensure-dialog.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { DepartmentService } from 'src/app/departments/department.service';
import { StudentSelectDialogService } from 'src/app/groups-students/group-student-edit/services/student-select-dialog.service';
import { PresenceResponseData } from 'src/app/presences/common/payload/response/presenceResponseData.interface';
import { AuthUser } from 'src/app/users/auth-user.model';
import { UserResponseData } from 'src/app/users/common/payload/response/userResponseData.interface';
import { UserService } from 'src/app/users/user.service';
import { ExcuseApplicationRequestData } from '../common/payload/request/excuseApplicationRequestData.interface';
import { ExcuseApplicationService } from '../excuse-application.service';
import { PresenceSelectDialogData } from './data/presenceSelectDialogData.interface';
import { PresenceSelectDialogService } from './services/presence-select-dialog.service';

@Component({
  selector: 'app-excuse-application-edit',
  templateUrl: './excuse-application-edit.component.html',
  styleUrls: ['./excuse-application-edit.component.css']
})
export class ExcuseApplicationEditComponent implements  OnInit, OnDestroy {
  excuseApplicationForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;
  private ensureDialogSubscription!: Subscription;
  ensureDialogStatus!: boolean;

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showSecretaryFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  delimeter: string = ',' + '\xa0';
  panelOpenState = false;

  tableLoaded: boolean = false;

  currentDepartmentId: number = 0;
  currentStudent: UserResponseData | null = null;
  currentAbsence: PresenceResponseData | null = null;

  @ViewChild('input') input!: ElementRef;
  @ViewChild(MatSelect) select!: MatSelect;

  departmentIdSubscription!: Subscription;
  studentSelectDialogSubscription!: Subscription;
  absenceSelectDialogSubscription!: Subscription;
  routeSubscription!: Subscription;
  presenceSubscription!: Subscription;
  createExcuseApplicationSubscription!: Subscription;
  updateExcuseApplicationSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private excuseApplicationService: ExcuseApplicationService,
    private departmentService: DepartmentService,
    private studentSelectDialogService: StudentSelectDialogService,
    private presenceSelectDialogService: PresenceSelectDialogService,
    private ensureDialogService: EnsureDialogService,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {

    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.currentUserId = this.currentUser.id;
        this.showAdminFeatures = this.currentUser.roles.includes('ROLE_ADMIN');
        this.showSecretaryFeatures = this.currentUser.roles.includes('ROLE_SECRETARY');
        this.showStudentFeatures = this.currentUser.roles.includes('ROLE_STUDENT');

        if (this.showStudentFeatures) {
          console.log("Inside student features");
          if (this.currentUser) {
            this.currentDepartmentId = this.currentUser?.department.id;
          } else {
            this.currentDepartmentId = 0;
          }
          this.userService.getUserById(this.currentUserId)
          .pipe(first())
          .subscribe((userResponseData: UserResponseData) => {
            this.currentStudent = userResponseData;
            this.setStudentInfo(this.currentStudent);
          });
        }
      }
    });

    console.log("BEFORE FORM INITIALIZATION: ");
    this.excuseApplicationForm = this.formBuilder.group({
      studentId: ['', Validators.required],
      absenceId: ['', Validators.required],
      reason: ['', Validators.required],
      status: [false, Validators.required]
    });
    
    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {

            this.presenceSubscription = this.excuseApplicationService.getExcuseApplicationById(this.id, this.currentUserId)
              .pipe(first())
              .subscribe((currentExcuseApplicationData: any) => {
                if (currentExcuseApplicationData !== null) {
                  this.excuseApplicationForm.patchValue({
                    studentId: currentExcuseApplicationData.absence.student.id,
                    absenceId: currentExcuseApplicationData.absence.id,
                    reason: currentExcuseApplicationData.reason,
                    status: currentExcuseApplicationData.status ? true : false
                  });
                  this.currentDepartmentId = currentExcuseApplicationData.absence.classSession.lecture.courseSchedule.course.department.id;
                  this.currentStudent = currentExcuseApplicationData.absence.student;
                  this.currentAbsence = currentExcuseApplicationData.absence;
                  console.log("Selected Department: "+ this.currentDepartmentId);
                } else {
                  this.onCancel();
                }
              });
          } else {
            
            if (!this.showStudentFeatures) {
              this.departmentIdSubscription = this.departmentService.departmentIdState
              //.pipe(first())
              .subscribe((_departmentId: number) => {
                if (_departmentId) {
                  console.log("Department ID: "+ _departmentId);
                  this.currentDepartmentId = _departmentId;
                }
              });

              this.studentSelectDialogSubscription = this.studentSelectDialogService.studentSelectDialogState
              .subscribe((student: UserResponseData | null)=> {
                this.excuseApplicationForm.controls.studentId.markAsTouched();
                if (student) {
                  this.setStudentInfo(student);
                } else {
                  if (!this.currentStudent) {
                    this.f.studentId.setErrors({
                      'required': true
                    });
                  }
                }
              });
            }

            this.absenceSelectDialogSubscription = this.presenceSelectDialogService.presenceSelectDialogState
            .subscribe((absence: PresenceResponseData | null)=> {
              this.excuseApplicationForm.controls.absenceId.markAsTouched();
              if (absence) {
                this.excuseApplicationForm.patchValue({
                  absenceId: absence.id
                });
                this.currentAbsence = absence;
              } else {
                if (!this.currentAbsence) {
                  this.f.absenceId.setErrors({
                    'required': true
                  });
                }
              }
            });

          }
        }
      );

  }

  get f() { return this.excuseApplicationForm.controls; }

  setStudentInfo(student: UserResponseData) {
    this.excuseApplicationForm.patchValue({
      studentId: student.id
    });
    this.checkForAbsenceIdValue();
    this.currentStudent = student;
  }

  selectStudent() {
    this.studentSelectDialogService.selectStudent({
      nameIdentifier: 'excuse-application',
      departmentId: this.currentDepartmentId
    });
  }

  selectAbsence() {
    if (this.currentStudent) {
      this.presenceSelectDialogService.selectPresence(this.createPresenceSelectDialogData(this.currentStudent, false, false));
    }
  }

  createPresenceSelectDialogData(currentStudent: UserResponseData, 
    presenceStatus: boolean | null, excuseStatus: boolean | null): PresenceSelectDialogData {
    const presenceSelectDialogData = {
      user: currentStudent,
      presenceStatus: presenceStatus,
      excuseStatus: excuseStatus
    }
    return presenceSelectDialogData;
  }

  checkForStudentIdValue() {
    if (this.excuseApplicationForm.value.studentId) {
      this.clearStudentValues();
    }
  }

  checkForAbsenceIdValue() {
    if (this.excuseApplicationForm.value.absenceId) {
      this.clearAbsenceValues();
    }
  }

  clearStudentValues() {
    this.excuseApplicationForm.patchValue({
      studentId: '',
    });

    this.currentStudent = null;
    this.excuseApplicationForm.controls.absenceId.markAsUntouched();
    this.clearAbsenceValues();
  }

  clearAbsenceValues() {
    this.excuseApplicationForm.patchValue({
      absenceId: ''
    });

    this.currentAbsence = null;
  }

  onSubmit() {
    this.submitted = true;

    if (this.excuseApplicationForm.invalid) {
      return;
    }

    this.isLoading = true;

    if (this.currentDepartmentId) {
      if (this.isAddMode) {
        const excuseApplicationData: ExcuseApplicationRequestData = {
          absenceId: this.excuseApplicationForm.value.absenceId,
          reason: this.excuseApplicationForm.value.reason,
          status: null
        };
  
        console.log("Excuse Application Request Data: ");
        console.log("Absence Id: "+JSON.stringify(this.excuseApplicationForm.value.absenceId));
        console.log("Reason: "+JSON.stringify(this.excuseApplicationForm.value.reason));
        console.log("Status: "+JSON.stringify(this.excuseApplicationForm.value.status));

        this.createExcuseApplication(excuseApplicationData);
      } else {
        const excuseApplicationData: ExcuseApplicationRequestData = {
          absenceId: this.excuseApplicationForm.value.absenceId,
          reason: this.excuseApplicationForm.value.reason,
          status: this.excuseApplicationForm.value.status
        };
        this.updateExcuseApplication(excuseApplicationData);
      }
    }

  }



  private createExcuseApplication(excuseApplicationData: ExcuseApplicationRequestData) {
    this.ensureDialogService.openDialog('will be submitted definitely', 'Excuse Application', 'add');
    this.isLoading = false;
    this.ensureDialogSubscription = this.ensureDialogService
      .ensureDialogState
      .pipe(first())
      .subscribe(
        (state: boolean) => {
          this.ensureDialogStatus = state;
          if (this.ensureDialogStatus) {
            //this.classGroup.isDeleting = true;
            console.log("Hallo "+this.ensureDialogStatus);
            this.createExcuseApplicationSubscription = this.excuseApplicationService.createExcuseApplication(excuseApplicationData, this.currentUserId)
              .pipe(last())
                .subscribe(() => {
                  console.log("DATA: "+ "Mpike sto subscribe");
                    this.snackbarService.success('Excuse application added');
                    this.router.navigate(['../'], { relativeTo: this.route });
                }).add(() => { this.isLoading = false; });
          }
        }
      );
  }

  private updateExcuseApplication(excuseApplicationData: ExcuseApplicationRequestData) {
    this.updateExcuseApplicationSubscription = this.excuseApplicationService.updateExcuseApplication(this.id, this.currentUserId, excuseApplicationData)
      .pipe(last())
      .subscribe(() => {
        this.snackbarService.success(excuseApplicationData.status ? (excuseApplicationData.status === true ? "Excuse application Approved" : "Excuse application Rejected") : "Excuse application Rejected" );
        this.excuseApplicationService.styleIndexSubject.next(-1);
        this.router.navigate(['../../'], { relativeTo: this.route});
      }).add(() => this.isLoading = false);
  }

  onCancel() {
    this.excuseApplicationService.styleIndexSubject.next(-1);
    this.router.navigate(['/excuse-applications'], { relativeTo: this.route});
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.presenceSubscription) {
      this.presenceSubscription.unsubscribe();
    }
    if (this.createExcuseApplicationSubscription) {
      this.createExcuseApplicationSubscription.unsubscribe();
    }
    if (this.updateExcuseApplicationSubscription) {
      this.updateExcuseApplicationSubscription.unsubscribe();
    }
    if (this.absenceSelectDialogSubscription) {
      this.absenceSelectDialogSubscription.unsubscribe();
    }
    if(this.ensureDialogSubscription) {
      this.ensureDialogSubscription.unsubscribe();
    }
  }

}