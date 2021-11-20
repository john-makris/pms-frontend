import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassesSessionsComponent } from './classes-sessions.component';

describe('ClassesSessionsComponent', () => {
  let component: ClassesSessionsComponent;
  let fixture: ComponentFixture<ClassesSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassesSessionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassesSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
