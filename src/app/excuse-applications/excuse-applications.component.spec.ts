import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcuseApplicationsComponent } from './excuse-applications.component';

describe('ExcuseApplicationsComponent', () => {
  let component: ExcuseApplicationsComponent;
  let fixture: ComponentFixture<ExcuseApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcuseApplicationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcuseApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
