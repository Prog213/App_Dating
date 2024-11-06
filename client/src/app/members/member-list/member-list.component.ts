import { Component, inject, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member.model';
import { MemberCardComponent } from "../member-card/member-card.component";

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
  private memberService = inject(MemberService);
  members: Member[] = [];

  ngOnInit(): void {
    this.getMembers();
  }

  getMembers() {
    this.memberService
      .getMembers()
      .subscribe((members) => (this.members = members));
  }
}
