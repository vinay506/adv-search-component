import { TestBed } from '@angular/core/testing';

import { AdvSearchLibService } from './adv-search-lib.service';

describe('AdvSearchLibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdvSearchLibService = TestBed.get(AdvSearchLibService);
    expect(service).toBeTruthy();
  });
});
