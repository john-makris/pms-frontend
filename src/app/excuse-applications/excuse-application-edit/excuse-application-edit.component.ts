import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first, last } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { DepartmentService } from 'src/app/departments/department.service';
import { StudentSelectDialogService } from 'src/app/groups-students/group-student-edit/services/student-select-dialog.service';
import { PresenceResponseData } from 'src/app/presences/common/payload/response/presenceResponseData.interface';
import { UserResponseData } from 'src/app/users/common/payload/response/userResponseData.interface';
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

  delimeter: string = ',' + '\xa0';
  panelOpenState = false;

  tableLoaded: boolean = false;

  currentDepartmentId: number = 0;
  currentStudent: UserResponseData | null = null;
  currentAbsence: PresenceResponseData | null = null;

  @ViewChild('input') input!: ElementRef;
  @ViewChild(MatSelect) select!: MatSelect;

  excuseApplicationTableLoadedSubscription!: Subscription;
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
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {

    this.excuseApplicationTableLoadedSubscription = this.excuseApplicationService.excuseApplicationTableLoadedState
      .subscribe((_status: boolean) => {
        if (_status) {
          this.tableLoaded = true;
        } else {
          this.tableLoaded = false;
        }
      });

    console.log("BEFORE FORM INITIALIZATION: ");
    this.excuseApplicationForm = this.formBuilder.group({
      studentId: ['', Validators.required],
      absenceId: ['', Validators.required],
      status: [false, Validators.required]
    });
    
    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.presenceSubscription = this.excuseApplicationService.getExcuseApplicationById(this.id)
              .pipe(first())
              .subscribe((currentExcuseApplicationData: any) => {
                if (currentExcuseApplicationData !== null) {
                  this.excuseApplicationForm.patchValue({
                    studentId: currentExcuseApplicationData.absence.student.id,
                    absenceId: currentExcuseApplicationData.absence.id,
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
            this.departmentIdSubscription = this.departmentService.departmentIdState
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
                this.excuseApplicationForm.patchValue({
                  studentId: student.id
                });
                this.checkForAbsenceIdValue();
                this.currentStudent = student;
              } else {
                if (!this.currentStudent) {
                  this.f.studentId.setErrors({
                    'required': true
                  });
                }
              }
            });

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

      /*
      this.classSessionFormDateChangesSubscription = this.presenceForm.controls.date.valueChanges.subscribe((date: Date) => {
        if (this.currentClassSession && date) {
          this.timeSpanModerator(this.currentClassSession, date);
        }
      });*/

  }

  get f() { return this.excuseApplicationForm.controls; }

  selectStudent() {
    this.studentSelectDialogService.selectStudent({
      nameIdentifier: 'excuse-application',
      departmentId: this.currentDepartmentId
    });
  }

  selectAbsence() {
    if (this.currentStudent) {
      this.presenceSelectDialogService.selectPresence(this.createPresenceSelectDialogData(this.currentStudent, false));
    }
  }

  createPresenceSelectDialogData(currentStudent: UserResponseData, presenceStatus: boolean | null): PresenceSelectDialogData {
    const presenceSelectDialogData = {
      user: currentStudent,
      presenceStatus: presenceStatus
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
          status: null
        };
  
        console.log("Excuse Application Request Data: ");
        console.log("Student Id: "+JSON.stringify(this.excuseApplicationForm.value.studentId));
        console.log("Absence Id: "+JSON.stringify(this.excuseApplicationForm.value.absenceId));
  
        this.createExcuseApplication(excuseApplicationData);
      } else {
        const excuseApplicationData: ExcuseApplicationRequestData = {
          absenceId: this.excuseApplicationForm.value.absenceId,
          status: this.excuseApplicationForm.value.status
        };
        this.updateExcuseApplication(excuseApplicationData);
      }
    }

  }

  private createExcuseApplication(excuseApplicationData: ExcuseApplicationRequestData) {
    this.createExcuseApplicationSubscription = this.excuseApplicationService.createExcuseApplication(excuseApplicationData)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success('Excuse application added');
          this.router.navigate(['../'], { relativeTo: this.route });
      }).add(() => { this.isLoading = false; });
  }

  private updateExcuseApplication(excuseApplicationData: ExcuseApplicationRequestData) {
    this.updateExcuseApplicationSubscription = this.excuseApplicationService.updateExcuseApplication(this.id, excuseApplicationData)
      .pipe(last())
      .subscribe(() => {
        this.snackbarService.success('Excuse application updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      }).add(() => this.isLoading = false);
  }

  onCancel() {
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
    if (this.excuseApplicationTableLoadedSubscription) {
      this.excuseApplicationTableLoadedSubscription.unsubscribe();
    }
  }

}