import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccountService } from '../services/account.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit {

  @Input() appHasRole: string[] = [];
  private accountService = inject(AccountService);
  private viewContainer = inject(ViewContainerRef);
  private template = inject(TemplateRef);

  ngOnInit(): void {
    if (this.accountService.roles().some((role) => this.appHasRole.includes(role))) {
      this.viewContainer.createEmbeddedView(this.template);
    } else {
      this.viewContainer.clear();
    }
  }
}
