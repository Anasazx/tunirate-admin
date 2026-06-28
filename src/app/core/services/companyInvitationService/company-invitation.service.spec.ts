import { TestBed } from '@angular/core/testing';

import { CompanyInvitationService } from './company-invitation.service';

describe('CompanyInvitationService', () => {
  let service: CompanyInvitationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyInvitationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
