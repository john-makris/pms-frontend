import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseScheduleEditComponent } from './course-schedule-edit.component';

describe('CourseScheduleEditComponent', () => {
  let component: CourseScheduleEditComponent;
  let fixture: ComponentFixture<CourseScheduleEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseScheduleEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseScheduleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
