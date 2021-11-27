import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresenceDetailComponent } from './presence-detail.component';

describe('PresenceDetailComponent', () => {
  let component: PresenceDetailComponent;
  let fixture: ComponentFixture<PresenceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresenceDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PresenceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
