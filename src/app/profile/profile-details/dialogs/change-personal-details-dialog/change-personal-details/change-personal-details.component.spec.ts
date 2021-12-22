import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePersonalDetailsComponent } from './change-personal-details.component';

describe('ChangePersonalDetailsComponent', () => {
  let component: ChangePersonalDetailsComponent;
  let fixture: ComponentFixture<ChangePersonalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangePersonalDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePersonalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
