import {inject, TestBed} from '@angular/core/testing';

import {GameLeaveGuardService} from './game-leave-guard.service';

describe('GameLeaveGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameLeaveGuardService]
    });
  });

  it('should be created', inject([GameLeaveGuardService], (service: GameLeaveGuardService) => {
    expect(service).toBeTruthy();
  }));
});
