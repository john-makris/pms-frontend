import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { last } from 'rxjs/operators';
import { ClassGroupService } from 'src/app/classes-groups/class-group.service';
import { ClassGroupResponseData } from 'src/app/classes-groups/common/payload/response/classGroupResponseData.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { UserResponseData } from 'src/app/users/common/payload/response/userResponseData.interface';
import { GroupStudentRequestData } from '../common/payload/request/groupStudentRequestData.interface';
import { GroupStudentService } from '../group-student.service';
import { StudentSelectDialogService } from './services/student-select-dialog.service';

@Component({
  selector: 'app-group-student-edit',
  templateUrl: './group-student-edit.component.html',
  styleUrls: ['./group-student-edit.component.css']
})
export class GroupStudentEditComponent implements OnInit, OnDestroy {
  groupStudentForm!: FormGroup;
  isLoading: boolean = false;
  submitted: boolean = false;

  selectedGroupNumber: string = '';
  currentStudentsOfGroup: number = 0;

  tableLoaded: boolean = false;
  delimeter: string = ',' + '\xa0';
  panelOpenState = false;

  currentStudent!: UserResponseData | null;
  currentClassGroup!: ClassGroupResponseData;

  tableLoadedStateSubscription!: Subscription;
  studentSelectDialogSubscription!: Subscription;
  routeSubscription!: Subscription;
  classGroupSubscription!: Subscription;
  createGroupStudentSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private classGroupService: ClassGroupService,
    private groupStudentService: GroupStudentService,
    private studentSelectDialogService: StudentSelectDialogService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {

    console.log("BEFORE FORM INITIALIZATION: ");
    this.groupStudentForm = this.formBuilder.group({
      studentId: ['', Validators.required]
    });

    this.tableLoadedStateSubscription = this.groupStudentService.groupStudentTableLoadedState
    .subscribe((loaded: boolean) => {
      if (loaded) {
        this.tableLoaded = loaded;
      } else {
        this.tableLoaded = false;
        this.onCancel();
      }
    });

    this.classGroupSubscription = this.classGroupService.classGroupSubject.subscribe((classGroup: ClassGroupResponseData | null) => {
      if (classGroup) {
       this.currentClassGroup = classGroup;
       console.log("Here is the Class Group: "+JSON.stringify(this.currentClassGroup));
      }
    });

    this.studentSelectDialogSubscription = this.studentSelectDialogService.studentSelectDialogState
    .subscribe((student: UserResponseData | null)=> {
      this.groupStudentForm.controls.studentId.markAsTouched();
      if (student) {
        this.groupStudentForm.patchValue({
          studentId: student.id
        });
        this.currentStudent = student;
      } else {
        if (!this.currentStudent) {
          this.gsf.studentId.setErrors({
            'required': true
          });
        }
      }
    });
    
  }

  get gsf() { return this.groupStudentForm.controls; }

  clearFormValues() {
    this.groupStudentForm.patchValue({
      studentId: ''
    });
    this.currentStudent = null;
  }

  selectStudent() {
    this.studentSelectDialogService.selectStudent(this.currentClassGroup);
  }

  onSubmit() {
    this.submitted = true;

    if (this.groupStudentForm.invalid) {
      return;
    }

    this.isLoading = true;

    const groupStudentData: GroupStudentRequestData = {
      classGroup: this.currentClassGroup,
      studentId: this.groupStudentForm.value.studentId
    };

    console.log("Group Student Request Data: ");
    console.log("Group Student Data: "+JSON.stringify(groupStudentData.classGroup));
    console.log("Student Id: "+groupStudentData.studentId);
    
    this.createGroupStudent(groupStudentData);
  }

  private createGroupStudent(groupStudentData: GroupStudentRequestData) {
    this.createGroupStudentSubscription = this.groupStudentService.createGroupStudent(groupStudentData)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success('Student added to Group');
          this.router.navigate(['../'], { relativeTo: this.route });
      }).add(() => { this.isLoading = false; });
  }

  onCancel() {
    this.router.navigate(['/students-of-groups'], { relativeTo: this.route});
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.classGroupSubscription) {
      this.classGroupSubscription.unsubscribe();
    }
    if (this.createGroupStudentSubscription) {
      this.createGroupStudentSubscription.unsubscribe();
    }
    if (this.studentSelectDialogSubscription) {
      this.studentSelectDialogSubscription.unsubscribe();
    }
    if (this.tableLoadedStateSubscription) {
      this.tableLoadedStateSubscription.unsubscribe();
    }
  }

}