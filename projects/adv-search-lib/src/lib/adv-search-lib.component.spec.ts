import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvSearchLibComponent } from './adv-search-lib.component';

describe('AdvSearchLibComponent', () => {
  let component: AdvSearchLibComponent;
  let fixture: ComponentFixture<AdvSearchLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvSearchLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvSearchLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
