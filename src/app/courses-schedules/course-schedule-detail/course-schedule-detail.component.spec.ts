import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseScheduleDetailComponent } from './course-schedule-detail.component';

describe('CourseScheduleDetailComponent', () => {
  let component: CourseScheduleDetailComponent;
  let fixture: ComponentFixture<CourseScheduleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseScheduleDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseScheduleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
