import { CompanyStatus } from '../enums/companyStatus.enum.model';

export interface CompanyStatusAction {
  status: CompanyStatus;
  label: string;
  // what the confirm dialog says; null means no confirmation needed
  confirm: string | null;
  danger: boolean;
}

// What an admin can do with a company in each status
export function companyStatusActions(current: CompanyStatus): CompanyStatusAction[] {
  const activate: CompanyStatusAction = { status: CompanyStatus.ACTIVE, label: current === CompanyStatus.PENDING ? 'Verify & activate' : 'Reactivate', confirm: null, danger: false };
  const reject: CompanyStatusAction = { status: CompanyStatus.REJECTED, label: 'Reject', confirm: 'The company will not be listed on the platform.', danger: true };
  const suspend: CompanyStatusAction = { status: CompanyStatus.SUSPENDED, label: 'Suspend', confirm: 'The company stays visible in the admin panel but is marked as suspended.', danger: true };
  const archive: CompanyStatusAction = { status: CompanyStatus.ARCHIVED, label: 'Archive', confirm: 'Archiving is only possible for companies without products.', danger: true };

  switch (current) {
    case CompanyStatus.PENDING: return [activate, reject];
    case CompanyStatus.ACTIVE: return [suspend, archive];
    case CompanyStatus.SUSPENDED: return [activate, archive];
    case CompanyStatus.REJECTED: return [activate, archive];
    case CompanyStatus.ARCHIVED: return [activate];
    default: return [];
  }
}
