import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first, last } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { LectureRequestData } from '../common/payload/request/lectureRecuestData.interface';
import { LectureTypeService } from '../lecture-types/lecture-type.service';
import { Lecture } from '../lecture.model';
import { LectureService } from '../lecture.service';
import { Room } from '../rooms/room.model';
import { RoomService } from '../rooms/room.service';
import { CourseScheduleSelectDialogService } from './services/course-schedule-select-dialog.sevice';
import * as moment from 'moment';
import { DateValidator } from 'src/app/common/helpers/date.validator';
import { LectureType } from '../lecture-types/lecture-type.model';

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

  lectureTypes: LectureType[] = [];
  selectedLectureTypeId: string = '';
  rooms: Room[] = [];
  selectedRoomId: string = '';

  delimeter: string = ',' + '\xa0';
  panelOpenState = false;

  selectedFiles!: FileList | undefined;
  currentFile!: File | undefined;

  state: boolean = false;
  currentCourseSchedule!: CourseSchedule;
  currentLecture!: Lecture;
  selectedAcademicYear: string = '';

  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  @ViewChild('input') input!: ElementRef;

  lectureTypeSubscription!: Subscription;
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
    private courseScheduleSelectDialogService: CourseScheduleSelectDialogService,
    private lectureService: LectureService,
    private lectureTypeService: LectureTypeService,
    private roomService: RoomService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.loadLectureTypes();
    this.loadRooms();

    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.lectureSubscription = this.lectureService.getLectureById(this.id)
              .pipe(first())
              .subscribe((currentLectureData: Lecture) => {
                this.currentLecture = currentLectureData;
                this.departmentService.departmentIdSubject.next(this.currentLecture.courseSchedule.course.department.id);
                this.lectureForm.patchValue({
                  lectureTypeId: currentLectureData.lectureType.id,
                  title: currentLectureData.title,
                  duration: currentLectureData.duration,
                  startTimestamp: currentLectureData.startTimestamp,
                  roomId: currentLectureData.room.id,
                  courseSchedule: currentLectureData.courseSchedule
                });
                this.currentCourseSchedule = currentLectureData.courseSchedule;
                this.selectedRoomId = currentLectureData.room.id.toString();
                this.selectedLectureTypeId = currentLectureData.lectureType.id.toString();
              });
          }
        }
      );

    this.departmentIdSubscription = this.departmentService.departmentIdState
      .subscribe((departmentId: number) => {
        if (departmentId === 0 && this.isAddMode) {
          this.onCancel();
        }
    });

    console.log("BEFORE FORM INITIALIZATION: ");
    this.lectureForm = this.formBuilder.group({
      courseSchedule: [null, Validators.required],
      lectureTypeId: [this.selectedLectureTypeId, Validators.required],
      hours: [null, [Validators.required, Validators.max(3), Validators.min(1)]],
      minutes: [null, [Validators.required, Validators.max(59), Validators.min(0)]],
      startTimestamp: [null, Validators.required],
      roomId: [this.selectedRoomId, Validators.required],
      title: [null, Validators.required]
    });

    this.courseScheduleSelectDialogSubscription = this.courseScheduleSelectDialogService.courseScheduleSelectDialogState
      .subscribe((_courseSchedule: CourseSchedule | null) => {
        this.lectureForm.controls.courseSchedule.markAsTouched();
        console.log("Course Schedule Data: "+JSON.stringify(_courseSchedule));
        if (_courseSchedule !== null) {
          console.log("CATCH COURSE SCHEDULE: "+_courseSchedule.course.name);
          this.lectureForm.patchValue({courseSchedule: _courseSchedule});
          this.currentCourseSchedule = _courseSchedule;
          console.log("Is course shcedule valid ? "+this.f.courseSchedule.valid);
        } else {
          if (!this.currentCourseSchedule) {
            this.f.courseSchedule.setErrors({
              'required': true
            });
          } else {
            console.log("Is course schedule valid ? "+this.f.course.valid);
          }
        }
    });
  }

  get f() { return this.lectureForm.controls; }
  
  selectCourseSchedule() {
    this.courseScheduleSelectDialogService.selectCourseSchedule(this.lectureForm.value.courseSchedule);
  }

  onSubmit() {
    this.submitted = true;

    if (this.lectureForm.invalid) {
      return;
    }

    this.isLoading = true;
    /*
    const lectureData: LectureRequestData = {
      courseSchedule: this.lectureForm.value.courseSchedule,
      lectureType: this.lectureForm.value.lectureType,
      duration: this.durationCalculatorInSeconds(),
      startTimestamp: this.lectureForm.value.startTimestamp,
      room: this.lectureForm.value.room,
      title: this.lectureForm.value.title
    };*/

    console.log("Lecture Form: ");
    console.log("Course Schedule: "+JSON.stringify(this.lectureForm.value.courseSchedule));
    console.log("Lecture Type Id: "+this.lectureForm.value.lectureTypeId);
    console.log("Duration in seconds: "+this.durationCalculatorInSeconds());
    console.log("Start Time Stamp: "+this.formatDateTime());
    console.log("Room Id: "+this.lectureForm.value.roomId);
    console.log("Title: "+this.lectureForm.value.title);
    //this.courseScheduleForm.reset();

    /*
    if (this.isAddMode) {
      this.createLecture(lectureData);
    } else {
      this.updateLecture(lectureData);
    }*/
  }

  private createLecture(lectureData: LectureRequestData) {
    this.createLectureSubscription = this.lectureService.createLecture(lectureData)
    .pipe(last())
      .subscribe(() => {
        console.log("DATA: "+ "Mpike sto subscribe");
          this.snackbarService.success('Lecture added');
          this.router.navigate(['../'], { relativeTo: this.route });
      }).add(() => { this.isLoading = false; });
  }

  private updateLecture(lectureData: LectureRequestData) {
    this.updateLectureSubscription = this.lectureService.updateLecture(this.id, lectureData)
      .pipe(last())
      .subscribe(() => {
        this.snackbarService.success('Lecture updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      }).add(() => this.isLoading = false);
  }

  loadLectureTypes() {
    this.lectureTypeSubscription = this.lectureTypeService.getAllLectureTypes()
    .pipe(first())
    .subscribe(lectureTypes => {
      this.lectureTypes = lectureTypes;
      console.log(this.lectureTypes);
    });
  }

  loadRooms() {
    this.roomSubscription = this.roomService.getAllRooms()
    .pipe(first())
    .subscribe(rooms => {
      this.rooms = rooms;
      console.log(this.rooms);
    });
  }

  formatDateTime(): String {
    const momentDate = new Date(this.lectureForm.controls.startTimestamp.value); // Replace event.value with your date value
    const formattedDate: String = moment(momentDate).format("YYYY/MM/DD HH:mm");
    console.log("Formated Date: "+formattedDate);
    return formattedDate;
  }

  durationCalculatorInSeconds(): number {
    return ((this.lectureForm.value.hours * 3600) + (this.lectureForm.value.minutes * 60));
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