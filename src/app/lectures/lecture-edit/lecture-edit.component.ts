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
import { LectureService } from '../lecture.service';
import { Room } from '../rooms/room.model';
import { CourseScheduleSelectDialogService } from './services/course-schedule-select-dialog.sevice';
import { LectureType } from '../lecture-types/lecture-type.model';
import { Lecture } from '../lecture.model';
import { MatSelect } from '@angular/material/select';
import { SelectionHelper } from 'src/app/common/helpers/selectionHelper';

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
  selectedLectureType!: LectureType;
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
  @ViewChild(MatSelect) select!: MatSelect;

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
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.loadLectureTypes();

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
                this.lectureForm.setValue({
                  courseSchedule: currentLectureData.courseSchedule,
                  lectureType: currentLectureData.lectureType,
                  title: currentLectureData.title
                });
                this.currentCourseSchedule = currentLectureData.courseSchedule;
                this.selectedLectureType = currentLectureData.lectureType;
                this.setSelectedValue(this.selectedLectureType, this.select.value);
                console.log("Selected Lecture Type: "+ JSON.stringify(this.selectedLectureType));
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
      lectureType: ['', Validators.required],
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

  setSelectedValue(selectedType: any, valueOfSelect: any): boolean {
    return SelectionHelper.objectComparisonFunction(selectedType, valueOfSelect);
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

    const lectureData: LectureRequestData = {
      courseSchedule: this.lectureForm.value.courseSchedule,
      lectureType: this.lectureForm.value.lectureType,
      title: this.lectureForm.value.title
    };

    console.log("Lecture Form: ");
    console.log("Course Schedule: "+JSON.stringify(this.lectureForm.value.courseSchedule));
    console.log("Lecture Type Id: "+this.lectureForm.value.lectureTypeId);
    console.log("Title: "+this.lectureForm.value.title);

    //this.courseScheduleForm.reset();

    if (this.isAddMode) {
      this.createLecture(lectureData);
    } else {
      this.updateLecture(lectureData);
    }
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