import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassGroupSelectDialogComponent } from './class-group-select-dialog.component';

describe('ClassGroupSelectDialogComponent', () => {
  let component: ClassGroupSelectDialogComponent;
  let fixture: ComponentFixture<ClassGroupSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassGroupSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassGroupSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
