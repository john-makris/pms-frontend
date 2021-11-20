import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupStudentDetailComponent } from './group-student-detail.component';

describe('GroupStudentDetailComponent', () => {
  let component: GroupStudentDetailComponent;
  let fixture: ComponentFixture<GroupStudentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupStudentDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupStudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
