import { CanDeactivateFn } from '@angular/router';
import { MemberEditComponent } from '../members/member-edit/member-edit.component';

export const preventChangesGuard: CanDeactivateFn<MemberEditComponent> = (
  component
) => {
  if (component.memberForm?.dirty) {
    return confirm('Are you sure to leave? Changed will be lost');
  }

  return true;
};
