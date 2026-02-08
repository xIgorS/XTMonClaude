import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayFlows } from './replay-flows';

describe('ReplayFlows', () => {
  let component: ReplayFlows;
  let fixture: ComponentFixture<ReplayFlows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplayFlows],
    }).compileComponents();

    fixture = TestBed.createComponent(ReplayFlows);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
