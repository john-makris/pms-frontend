import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcuseApplicationDetailComponent } from './excuse-application-detail.component';

describe('ExcuseApplicationDetailComponent', () => {
  let component: ExcuseApplicationDetailComponent;
  let fixture: ComponentFixture<ExcuseApplicationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcuseApplicationDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcuseApplicationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
