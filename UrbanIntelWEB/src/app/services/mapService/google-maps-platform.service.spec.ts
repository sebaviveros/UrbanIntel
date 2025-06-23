import { TestBed } from '@angular/core/testing';

import { GoogleMapsPlatformService } from './google-maps-platform.service';

describe('GoogleMapsPlatformService', () => {
  let service: GoogleMapsPlatformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleMapsPlatformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
