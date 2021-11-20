import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupStudentEditComponent } from './group-student-edit.component';

describe('GroupStudentEditComponent', () => {
  let component: GroupStudentEditComponent;
  let fixture: ComponentFixture<GroupStudentEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupStudentEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupStudentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
