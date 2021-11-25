import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectureSelectDialogComponent } from './lecture-select-dialog.component';

describe('LectureSelectDialogComponent', () => {
  let component: LectureSelectDialogComponent;
  let fixture: ComponentFixture<LectureSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LectureSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LectureSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
