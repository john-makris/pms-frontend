import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveCourseDetailComponent } from './active-course-detail.component';

describe('ActiveCourseDetailComponent', () => {
  let component: ActiveCourseDetailComponent;
  let fixture: ComponentFixture<ActiveCourseDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveCourseDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveCourseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
