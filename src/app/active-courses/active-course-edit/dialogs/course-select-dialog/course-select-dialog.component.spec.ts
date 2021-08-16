import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseSelectDialogComponent } from './course-select-dialog.component';

describe('CourseSelectDialogComponent', () => {
  let component: CourseSelectDialogComponent;
  let fixture: ComponentFixture<CourseSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
