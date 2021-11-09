import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassGroupDetailComponent } from './class-group-detail.component';

describe('ClassGroupDetailComponent', () => {
  let component: ClassGroupDetailComponent;
  let fixture: ComponentFixture<ClassGroupDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassGroupDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassGroupDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
