import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSelectDialogComponent } from './student-select-dialog.component';

describe('StudentSelectDialogComponent', () => {
  let component: StudentSelectDialogComponent;
  let fixture: ComponentFixture<StudentSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
