import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseScheduleSelectComponent } from './course-schedule-select.component';

describe('CourseScheduleSelectComponent', () => {
  let component: CourseScheduleSelectComponent;
  let fixture: ComponentFixture<CourseScheduleSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseScheduleSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseScheduleSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
