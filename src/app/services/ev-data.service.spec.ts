import { TestBed } from '@angular/core/testing';

import { EvDataService } from '../services/ev-data.service';

describe('EvDataService', () => {
  let service: EvDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
