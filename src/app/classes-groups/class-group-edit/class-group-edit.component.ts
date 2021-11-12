import { NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { first, last } from 'rxjs/operators';
import { SelectionHelper } from 'src/app/common/helpers/selectionHelper';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { DepartmentService } from 'src/app/departments/department.service';
import { LectureType } from 'src/app/lectures/lecture-types/lecture-type.model';
import { LectureTypeService } from 'src/app/lectures/lecture-types/lecture-type.service';
import { ClassGroupService } from '../class-group.service';
import { ClassGroupRequestData } from '../common/payload/request/classGroupRequestData.interface';
import { ClassGroupResponseData } from '../common/payload/response/classGroupResponseData.interface';
import { Room } from '../rooms/room.model';
import { RoomService } from '../rooms/room.service';

@Component({
  selector: 'app-class-group-edit',
  templateUrl: './class-group-edit.component.html',
  styleUrls: ['./class-group-edit.component.css']
})
export class ClassGroupEditComponent implements OnInit, OnDestroy {
  classGroupForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;

  selectedGroupNumber: string = '';

  delimeter: string = ',' + '\xa0';
  panelOpenState = false;

  selectedFiles!: FileList | undefined;
  currentFile!: File | undefined;

  suffixes: string[] = [];
  rooms: Room[] = [];
  selectedRoom: Room | string = '';

  state: boolean = false;
  currentCourseSchedule!: CourseSchedule;
  currentClassGroupType!: LectureType;
  currentClassGroup!: ClassGroupResponseData;
  selectedIdentifierSuffix: string = '';

  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');
  selectedStartTime: string = moment(new Date().getTime()).format("HH:mm");

  @ViewChild('input') input!: ElementRef;
  @ViewChild(MatSelect) select!: MatSelect;

  classGroupFormChangesSubscription!: Subscription;
  lectureTypeSubscription!: Subscription;
  identifierSuffixesSubscription!: Subscription;
  roomSubscription!: Subscription;
  courseScheduleSelectDialogSubscription!: Subscription;
  routeSubscription!: Subscription;
  departmentIdSubscription!: Subscription;
  classGroupSubscription!: Subscription;
  createClassGroupSubscription!: Subscription;
  updateClassGroupSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private courseScheduleService: CourseScheduleService,
    private classGroupService: ClassGroupService,
    private lectureTypeService: LectureTypeService,
    private roomService: RoomService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {

    this.loadRooms();

    this.courseScheduleService.courseScheduleState.
    pipe(first())
    .subscribe((_courseSchedule: CourseSchedule | null) => {
      if (_courseSchedule !== null) {
        this.currentCourseSchedule = _courseSchedule;
        console.log("Subscribed Class Group course schedule: "+JSON.stringify(_courseSchedule));
      } else {
        this.onCancel();
      }
    });



    this.identifierSuffixesSubscription = this.classGroupService.identifierSuffixesState.subscribe(
      (suffixesList: Array<string>) => {
        if (suffixesList.length !== 0) {
          this.suffixes = suffixesList;
        } else {
          this.onCancel();
        }
    });

    console.log("BEFORE FORM INITIALIZATION: ");
    this.classGroupForm = this.formBuilder.group({
      identifierSuffix: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      startTime: [this.selectedStartTime, Validators.required],
      endTime: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(300)]],
      room: ['', Validators.required]
    });
    
    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.classGroupSubscription = this.classGroupService.getClassGroupById(this.id)
              .pipe(first())
              .subscribe((currentClassGroupData: ClassGroupResponseData) => {
                if (currentClassGroupData !== null) {
                  this.currentClassGroup = currentClassGroupData;
                  this.departmentService.departmentIdSubject.next(this.currentClassGroup.courseSchedule.course.department.id);
                  this.classGroupForm.patchValue({
                    identifierSuffix: currentClassGroupData.identifierSuffix,
                    startTime: currentClassGroupData.startTime,
                    endTime: currentClassGroupData.endTime,
                    capacity: currentClassGroupData.capacity,
                    room: currentClassGroupData.room
                  });
                  this.currentCourseSchedule = currentClassGroupData.courseSchedule;
                  this.currentClassGroupType = currentClassGroupData.lectureType;
                  this.selectedIdentifierSuffix = currentClassGroupData.identifierSuffix;
                  //this.setSelectedValue(this.selectedLectureType, this.select.value);
                  console.log("Selected Lecture Type: "+ JSON.stringify(this.currentClassGroupType));
                } else {
                  this.onCancel();
                }
              });
          } else {
            this.lectureTypeService.lectureTypeState.subscribe(
              (_lectureType: LectureType | null) => {
              if(_lectureType !== null) {
                this.currentClassGroupType = _lectureType;
              } else {
                this.onCancel();
              }
            });
          }
        }
      );
    
    if (this.isAddMode) {
      this.endTimeCalculator();

      this.classGroupFormChangesSubscription = this.classGroupForm.controls.startTime.valueChanges.subscribe((startTime: string) => {
        this.selectedStartTime = startTime;
        this.endTimeCalculator();
      });
    }
  }

  setSelectedValue(selectedType: any, valueOfSelect: any): boolean {
    return SelectionHelper.objectComparisonFunction(selectedType, valueOfSelect);
  }

  get f() { return this.classGroupForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.classGroupForm.invalid) {
      return;
    }

    this.isLoading = true;

    const classGroupData: ClassGroupRequestData = {
      courseSchedule: this.currentCourseSchedule,
      lectureType: this.currentClassGroupType,
      identifierSuffix: this.classGroupForm.value.identifierSuffix,
      startTime: this.classGroupForm.value.startTime,
      capacity: this.classGroupForm.value.capacity,
      room: this.classGroupForm.value.room
    };

    console.log("Class Group Request Data: ");
    console.log("Course Schedule: "+JSON.stringify(this.currentCourseSchedule));
    console.log("Lecture Type: "+JSON.stringify(this.currentClassGroupType));
    console.log("Identifier Suffix: "+this.classGroupForm.value.identifierSuffix);
    console.log("Start time: "+this.classGroupForm.value.startTime);
    console.log("Capacity: "+this.classGroupForm.value.capacity);
    console.log("Room: "+JSON.stringify(this.classGroupForm.value.room));
    //this.courseScheduleForm.reset();
    
    if (this.isAddMode) {
      this.createClassGroup(classGroupData);
    } else {
      this.updateClassGroup(classGroupData);
    }
  }

  private createClassGroup(classGroupData: ClassGroupRequestData) {
    this.createClassGroupSubscription = this.classGroupService.createClassGroup(classGroupData)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success('Class Group added');
          this.router.navigate(['../'], { relativeTo: this.route });
      }).add(() => { this.isLoading = false; });
  }

  private updateClassGroup(classGroupData: ClassGroupRequestData) {
    this.updateClassGroupSubscription = this.classGroupService.updateClassGroup(this.id, classGroupData)
      .pipe(last())
      .subscribe(() => {
        this.snackbarService.success('Class Group updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      }).add(() => this.isLoading = false);
  }

  loadRooms() {
    this.roomSubscription = this.roomService.getAllRooms()
    .pipe(first())
    .subscribe(rooms => {
      this.rooms = rooms;
      console.log(this.rooms);
    });
  }

  onCancel() {
    this.router.navigate(['/classes-groups'], { relativeTo: this.route});
  }

  endTimeCalculator() {
    const date = new Date();
    let endTime;
    date.setHours(+this.selectedStartTime.split(":")[0]);
    date.setMinutes(+this.selectedStartTime.split(":")[1]);
    if (this.currentClassGroupType.name === 'Theory') {
      endTime = moment(date.getTime()).add(moment.duration(this.currentCourseSchedule.theoryLectureDuration * 1000)).format("HH:mm");
    }
    if (this.currentClassGroupType.name === 'Lab') {
      endTime = moment(date.getTime()).add(moment.duration(this.currentCourseSchedule.labLectureDuration * 1000)).format("HH:mm");
    }
    console.log("Selected time: "+moment(date.getTime()).format("HH:mm"));
    console.log("End Time: "+endTime);
    this.classGroupForm.patchValue({
      endTime: endTime
    });
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
    if (this.createClassGroupSubscription) {
      this.createClassGroupSubscription.unsubscribe();
    }
    if (this.updateClassGroupSubscription) {
      this.updateClassGroupSubscription.unsubscribe();
    }
    if (this.classGroupFormChangesSubscription) {
      this.classGroupFormChangesSubscription.unsubscribe();
    }
  }

}