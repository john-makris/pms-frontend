import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnsureDialogComponent } from './ensure-dialog.component';

describe('EnsureDialogComponent', () => {
  let component: EnsureDialogComponent;
  let fixture: ComponentFixture<EnsureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnsureDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnsureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
