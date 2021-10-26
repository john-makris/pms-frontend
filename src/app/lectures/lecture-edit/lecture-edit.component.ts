import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { CourseSchedule } from 'src/app/courses-schedules/course-schedule.model';
import { CourseScheduleService } from 'src/app/courses-schedules/course-schedule.service';
import { School } from 'src/app/schools/school.model';
import { SchoolService } from 'src/app/schools/school.service';
import { LectureService } from '../lecture.service';

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
  coursesSchedules: CourseSchedule[] = [];
  selectedCourseScheduleId: string = '';
  allCoursesSchedules: boolean = true;

  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  courseScheduleIdSubscription!: Subscription;
  routeSubscription!: Subscription;
  lectureSubscription!: Subscription;
  coursesSchedulesSubscription!: Subscription;
  createLectureSubscription!: Subscription;
  updateLectureSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lectureService: LectureService,
    private courseScheduleService: CourseScheduleService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.courseScheduleIdSubscription = this.courseScheduleIdSubscription = this.courseScheduleService.courseScheduleIdState
      .subscribe((courseScheduleId: number) => {
        console.log("EDIT COMPONENT: "+courseScheduleId);
        if (courseScheduleId == 0) {
          this.allCoursesSchedules = true;
        } else {
          this.allCoursesSchedules = false;
          this.selectedCourseScheduleId = courseScheduleId.toString();
        }
    });

    this.id = this.route.snapshot.params['id'];
    this.routeSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.lectureSubscription = this.lectureService.getLectureById(this.id)
              .pipe(first())
              .subscribe((currentLectureData: any) => {
                this.lectureForm.patchValue({
                  title: currentLectureData.title,
                  courseScheduleId: currentLectureData.courseSchedule.id
                });
                this.selectedCourseScheduleId = currentLectureData.courseSchedule.id.toString();
                console.log(currentLectureData.courseSchedule.id);
              });
          } else {
            if (this.allCoursesSchedules) {
              this.loadCoursesSchedules();
            }
          }
        }
      );
        console.log("BEFORE FORM INITIALIZATION: "+this.selectedCourseScheduleId);
      this.lectureForm = this.formBuilder.group({
        title: ['', Validators.required],
        courseScheduleId: [this.selectedCourseScheduleId, Validators.required],
        hideRequired: this.hideRequiredControl,
        floatLabel: this.floatLabelControl
      });
  }

  get f() { return this.lectureForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.lectureForm.invalid) {
      return;
    }

    this.isLoading = true;
    const lectureData = {
      title: this.lectureForm.value.title,
      courseScheduleId: {
        id: this.lectureForm.value.courseScheduleId
      }
    };

    this.lectureForm.reset();

    if (this.isAddMode) {
      this.createLecture(lectureData);
    } else {
      this.updateLecture(lectureData);
    }
  }

  private createLecture(lectureData: any) {
    this.createLectureSubscription = this.lectureService.createLecture(lectureData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Lecture added');
        this.router.navigate(['../'], { relativeTo: this.route });
      })
      .add(() => { this.isLoading = false; });
  }

  private updateLecture(lectureData: any) {
    this.updateLectureSubscription = this.lectureService.updateLecture(this.id, lectureData)
      .pipe(first())
      .subscribe(() => {
        this.snackbarService.success('Lecture updated');
        this.router.navigate(['../../'], { relativeTo: this.route});
      })
      .add(() => this.isLoading = false);
  }

  loadCoursesSchedules() {
    this.coursesSchedulesSubscription = this.courseScheduleService.getAllCoursesSchedules()
    .pipe(first())
    .subscribe(coursesSchedules => {
      this.coursesSchedules = coursesSchedules;
      console.log(this.coursesSchedules);
    });
  }

  onCancel() {
    this.router.navigate(['/lectures'], { relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.courseScheduleIdSubscription) {
      this.courseScheduleIdSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.lectureSubscription) {
      this.lectureSubscription.unsubscribe();
    }
    if (this.createLectureSubscription) {
      this.createLectureSubscription.unsubscribe();
    }
    if (this.updateLectureSubscription) {
      this.updateLectureSubscription.unsubscribe();
    }
    if(this.coursesSchedulesSubscription) {
      this.coursesSchedulesSubscription.unsubscribe();
    }
  }

}