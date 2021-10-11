import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesSchedulesComponent } from './courses-schedules.component';

describe('CoursesSchedulesComponent', () => {
  let component: CoursesSchedulesComponent;
  let fixture: ComponentFixture<CoursesSchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoursesSchedulesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
