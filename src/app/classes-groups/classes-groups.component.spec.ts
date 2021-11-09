import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassesGroupsComponent } from './classes-groups.component';

describe('ClassesGroupsComponent', () => {
  let component: ClassesGroupsComponent;
  let fixture: ComponentFixture<ClassesGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassesGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassesGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
