import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassGroupEditComponent } from './class-group-edit.component';

describe('ClassGroupEditComponent', () => {
  let component: ClassGroupEditComponent;
  let fixture: ComponentFixture<ClassGroupEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassGroupEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
