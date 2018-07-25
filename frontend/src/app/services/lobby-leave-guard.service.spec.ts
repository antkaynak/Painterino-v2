import {inject, TestBed} from '@angular/core/testing';

import {LobbyLeaveGuardService} from './lobby-leave-guard.service';

describe('LobbyLeaveGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LobbyLeaveGuardService]
    });
  });

  it('should be created', inject([LobbyLeaveGuardService], (service: LobbyLeaveGuardService) => {
    expect(service).toBeTruthy();
  }));
});
