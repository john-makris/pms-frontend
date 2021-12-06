import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresenceSelectDialogComponent } from './presence-select-dialog.component';

describe('PresenceSelectDialogComponent', () => {
  let component: PresenceSelectDialogComponent;
  let fixture: ComponentFixture<PresenceSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresenceSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PresenceSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
