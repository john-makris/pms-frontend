import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcuseApplicationEditComponent } from './excuse-application-edit.component';

describe('ExcuseApplicationEditComponent', () => {
  let component: ExcuseApplicationEditComponent;
  let fixture: ComponentFixture<ExcuseApplicationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcuseApplicationEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcuseApplicationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
