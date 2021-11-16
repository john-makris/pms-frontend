import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsStudentsComponent } from './groups-students.component';

describe('GroupsStudentsComponent', () => {
  let component: GroupsStudentsComponent;
  let fixture: ComponentFixture<GroupsStudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupsStudentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
