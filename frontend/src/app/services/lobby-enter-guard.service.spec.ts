import { TestBed, inject } from '@angular/core/testing';

import { LobbyEnterGuardService } from './lobby-enter-guard.service';

describe('LobbyEnterGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LobbyEnterGuardService]
    });
  });

  it('should be created', inject([LobbyEnterGuardService], (service: LobbyEnterGuardService) => {
    expect(service).toBeTruthy();
  }));
});
