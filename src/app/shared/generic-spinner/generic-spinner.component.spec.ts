import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericSpinnerComponent } from './generic-spinner.component';

describe('GenericSpinnerComponent', () => {
  let component: GenericSpinnerComponent;
  let fixture: ComponentFixture<GenericSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
