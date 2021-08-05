import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveCourseListComponent } from './active-course-list.component';

describe('ActiveCourseListComponent', () => {
  let component: ActiveCourseListComponent;
  let fixture: ComponentFixture<ActiveCourseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveCourseListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveCourseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
