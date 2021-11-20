import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassSessionDetailComponent } from './class-session-detail.component';

describe('ClassSessionDetailComponent', () => {
  let component: ClassSessionDetailComponent;
  let fixture: ComponentFixture<ClassSessionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassSessionDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassSessionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
