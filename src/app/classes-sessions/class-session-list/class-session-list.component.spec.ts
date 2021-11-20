import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassSessionListComponent } from './class-session-list.component';

describe('ClassSessionListComponent', () => {
  let component: ClassSessionListComponent;
  let fixture: ComponentFixture<ClassSessionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassSessionListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassSessionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
