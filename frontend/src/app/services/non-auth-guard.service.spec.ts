import { TestBed, inject } from '@angular/core/testing';

import { NonAuthGuardService } from './non-auth-guard.service';

describe('NonAuthGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NonAuthGuardService]
    });
  });

  it('should be created', inject([NonAuthGuardService], (service: NonAuthGuardService) => {
    expect(service).toBeTruthy();
  }));
});
