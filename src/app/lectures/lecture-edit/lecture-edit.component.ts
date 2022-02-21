import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first, last, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { LectureRequestData } from '../common/payload/request/lectureRequestData.interface';
import { LectureTypeService } from '../lecture-types/lecture-type.service';
import { LectureService } from '../lecture.service';
import { Room } from '../../classes-groups/rooms/room.model';
import { CourseScheduleSelectDialogService } from './services/course-schedule-select-dialog.sevice';
import { LectureType } from '../lecture-types/lecture-type.model';
import { MatSelect } from '@angular/material/select';
import { SelectionHelper } from 'src/app/common/helpers/selectionHelper';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { LectureResponseData } from '../common/payload/response/lectureResponseData.interface';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthUser } from 'src/app/users/auth-user.model';

@Component({
  selector: 'app-lecture-edit',
  templateUrl: './lecture-edit.component.html',
  styleUrls: ['./lecture-edit.component.css']
})
export class LectureEditComponent implements OnInit, OnDestroy {
  lectureForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;

  currentUser: AuthUser | null = null;
  currentUserId: number = 0;
  showAdminFeatures: boolean = false;
  showTeacherFeatures: boolean = false;
  showStudentFeatures: boolean = false;

  selectedLectureNumber: string = '';

  delimeter: string = ',' + '\xa0';
  panelOpenState = false;

  selectedFiles!: FileList | undefined;
  currentFile!: File | undefined;

  suffixes: string[] = [];

  state: boolean = false;
  currentCourseSchedule!: CourseSchedule;
  currentLectureType!: LectureType;
  currentLecture!: LectureResponseData;
  selectedIdentifierSuffix: string = '';

  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  @ViewChild('input') input!: ElementRef;
  @ViewChild(MatSelect) select!: MatSelect;

  lectureTypeSubscription!: Subscription;
  identifierSuffixesSubscription!: Subscription;
  roomSubscription!: Subscription;
  courseScheduleSelectDialogSubscription!: Subscription;
  routeSubscription!: Subscription;
  departmentIdSubscription!: Subscription;
  lectureSubscription!: Subscription;
  createLectureSubscription!: Subscription;
  updateLectureSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private courseScheduleService: CourseScheduleService,
    private lectureService: LectureService,
    private lectureTypeService: LectureTypeService,
    private snackbarService: SnackbarService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.authService.user.subscribe((user: AuthUser | null) => {
      if (user) {
        this.currentUser = user;
        this.currentUserId = this.currentUser.id;
        console.log("Current User Id: "+this.currentUserId);

        this.showAdminFeatures = this.currentUser.roles.includes('ROLE_ADMIN');
        this.showTeacherFeatures = this.currentUser.roles.includes('ROLE_TEACHER');
        this.showStudentFeatures = this.currentUser.roles.includes('ROLE_STUDENT');
      }
    });

    this.courseScheduleService.courseScheduleState.subscribe((_courseSchedule: CourseSchedule | null) => {
      if (_courseSchedule !== null) {
        this.currentCourseSchedule = _courseSchedule;
        console.log("Subscribed Lecture course schedule: "+JSON.stringify(_courseSchedule));
      } else {
        this.onCancel();
      }
    });

    this.identifierSuffixesSubscription = this.lectureService.identifierSuffixesState.subscribe(
      (suffixesList: Array<string>) => {
        if (suffixesList.length !== 0) {
          this.suffixes = suffixesList;
        } else {
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
              this.router.navigate(['../../../'], { relativeTo: this.route});
            }

            this.lectureSubscription = this.lectureService.getLectureById(this.id, this.currentUserId)
              .pipe(first())
              .subscribe((currentLectureData: LectureResponseData) => {
                if (currentLectureData !== null) {
                  this.currentLecture = currentLectureData;
                  this.departmentService.departmentIdSubject.next(this.currentLecture.courseSchedule.course.department.id);
                  this.lectureForm.patchValue({
                    identifierSuffix: currentLectureData.identifierSuffix,
                    title: currentLectureData.title
                  });
                  this.currentCourseSchedule = currentLectureData.courseSchedule;
                  this.currentLectureType = currentLectureData.lectureType;
                  this.selectedIdentifierSuffix = currentLectureData.identifierSuffix;
                  //this.setSelectedValue(this.selectedLectureType, this.select.value);
                  console.log("Selected Lecture Type: "+ JSON.stringify(this.currentLectureType));
                } else {
                  this.onCancel();
                }
              });
          } else {
            this.lectureTypeService.lectureTypeState.subscribe(
              (_lectureType: LectureType | null) => {
              if(_lectureType !== null) {
                this.currentLectureType = _lectureType;
              } else {
                this.onCancel();
              }
            });

            if (this.showStudentFeatures) {
              this.router.navigate(['../../'], { relativeTo: this.route});
            }
          }
        }
      );

    console.log("BEFORE FORM INITIALIZATION: ");
    this.lectureForm = this.formBuilder.group({
      identifierSuffix: ['', Validators.required],
      title: [null, Validators.required]
    });
  }

  /*setSelectedValue(selectedType: any, valueOfSelect: any): boolean {
    return SelectionHelper.objectComparisonFunction(selectedType, valueOfSelect);
  }*/

  get f() { return this.lectureForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.lectureForm.invalid) {
      return;
    }

    this.isLoading = true;

    const lectureData: LectureRequestData = {
      courseSchedule: this.currentCourseSchedule,
      lectureType: this.currentLectureType,
      identifierSuffix: this.lectureForm.value.identifierSuffix,
      title: this.lectureForm.value.title
    };

    console.log("Lecture Form: ");
    console.log("Course Schedule: "+JSON.stringify(this.currentCourseSchedule));
    console.log("Lecture Type Id: "+this.currentLectureType.id);
    console.log("Identifier Suffix: "+this.lectureForm.value.identifierSuffix);
    console.log("Title: "+this.lectureForm.value.title);
    //this.courseScheduleForm.reset();

    if (this.isAddMode) {
      this.createLecture(lectureData);
    } else {
      this.updateLecture(lectureData);
    }
  }

  private createLecture(lectureData: LectureRequestData) {
    this.createLectureSubscription = this.lectureService.createLecture(lectureData, this.currentUserId)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success('Lecture added');
          this.router.navigate(['../'], { relativeTo: this.route });
      }).add(() => { this.isLoading = false; });
  }

  private updateLecture(lectureData: LectureRequestData) {
    this.updateLectureSubscription = this.lectureService.updateLecture(this.id, this.currentUserId, lectureData)
      .pipe(last())
      .subscribe(() => {
        this.snackbarService.success('Lecture updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      }).add(() => this.isLoading = false);
  }

  onCancel() {
    this.router.navigate(['/lectures'], { relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.departmentIdSubscription) {
      this.departmentIdSubscription.unsubscribe();
    }
    if (this.lectureSubscription) {
      this.lectureSubscription.unsubscribe();
    }
    if (this.courseScheduleSelectDialogSubscription) {
      this.courseScheduleSelectDialogSubscription.unsubscribe();
    }
    if (this.createLectureSubscription) {
      this.createLectureSubscription.unsubscribe();
    }
    if (this.updateLectureSubscription) {
      this.updateLectureSubscription.unsubscribe();
    }
  }

}