import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassSessionSelectDialogComponent } from './class-session-select-dialog.component';

describe('ClassSessionSelectDialogComponent', () => {
  let component: ClassSessionSelectDialogComponent;
  let fixture: ComponentFixture<ClassSessionSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassSessionSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassSessionSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
