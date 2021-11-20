import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassSessionEditComponent } from './class-session-edit.component';

describe('ClassSessionEditComponent', () => {
  let component: ClassSessionEditComponent;
  let fixture: ComponentFixture<ClassSessionEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassSessionEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassSessionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
