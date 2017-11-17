import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAuthComponent } from './main-auth.component';

describe('MainAuthComponent', () => {
  let component: MainAuthComponent;
  let fixture: ComponentFixture<MainAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
