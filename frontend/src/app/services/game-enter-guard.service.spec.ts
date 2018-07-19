import { TestBed, inject } from '@angular/core/testing';

import { GameEnterGuardService } from './game-enter-guard.service';

describe('GameEnterGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameEnterGuardService]
    });
  });

  it('should be created', inject([GameEnterGuardService], (service: GameEnterGuardService) => {
    expect(service).toBeTruthy();
  }));
});
