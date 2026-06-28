import { TestBed } from '@angular/core/testing';

import { CompanyMemberService } from './company-member.service';

describe('CompanyMemberService', () => {
  let service: CompanyMemberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyMemberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
