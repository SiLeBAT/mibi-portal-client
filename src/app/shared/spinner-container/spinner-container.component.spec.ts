import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerContainerComponent } from './spinner-container.component';

describe('LoadingSpinnerComponent', () => {
  let component: SpinnerContainerComponent;
  let fixture: ComponentFixture<SpinnerContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpinnerContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
