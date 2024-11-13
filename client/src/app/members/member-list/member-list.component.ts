import { Component, inject, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { MemberCardComponent } from '../member-card/member-card.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent, PaginationModule, FormsModule, ButtonsModule],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
  memberService = inject(MemberService);
  genderlist = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}];

  members = this.memberService.paginatedResult.asReadonly();
  userParams = this.memberService.userParams;

  ngOnInit(): void {
    if (!this.members()) this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers();
  }

  resetFilters() {
    this.memberService.resetFilters();
    this.loadMembers();
  }

  pageChanged(event: any) {
    if (this.userParams().pageNumber !== event.page) {
      this.userParams().pageNumber = event.page;
      this.loadMembers();
    }
  }
}
