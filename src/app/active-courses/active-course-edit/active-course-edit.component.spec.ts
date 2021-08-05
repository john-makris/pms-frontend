import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveCourseEditComponent } from './active-course-edit.component';

describe('ActiveCourseEditComponent', () => {
  let component: ActiveCourseEditComponent;
  let fixture: ComponentFixture<ActiveCourseEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveCourseEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveCourseEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
