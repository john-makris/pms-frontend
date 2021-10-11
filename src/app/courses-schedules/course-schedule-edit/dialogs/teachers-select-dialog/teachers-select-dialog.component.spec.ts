import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachersSelectDialogComponent } from './teachers-select-dialog.component';

describe('TeachersSelectDialogComponent', () => {
  let component: TeachersSelectDialogComponent;
  let fixture: ComponentFixture<TeachersSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeachersSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeachersSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
