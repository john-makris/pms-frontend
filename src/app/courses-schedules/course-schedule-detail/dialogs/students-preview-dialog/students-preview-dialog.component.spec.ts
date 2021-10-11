import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsPreviewDialogComponent } from './students-preview-dialog.component';

describe('StudentsPreviewDialogComponent', () => {
  let component: StudentsPreviewDialogComponent;
  let fixture: ComponentFixture<StudentsPreviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentsPreviewDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsPreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
