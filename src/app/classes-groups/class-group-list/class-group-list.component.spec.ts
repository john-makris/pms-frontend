import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassGroupListComponent } from './class-group-list.component';

describe('ClassGroupListComponent', () => {
  let component: ClassGroupListComponent;
  let fixture: ComponentFixture<ClassGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassGroupListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
