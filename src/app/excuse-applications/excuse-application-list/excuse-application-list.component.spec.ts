import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcuseApplicationListComponent } from './excuse-application-list.component';

describe('ExcuseApplicationListComponent', () => {
  let component: ExcuseApplicationListComponent;
  let fixture: ComponentFixture<ExcuseApplicationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcuseApplicationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcuseApplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
