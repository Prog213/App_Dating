import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AccountService } from '../../services/account.service';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member.model';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-member-edit',
  standalone: true,
  imports: [TabsModule, FormsModule],
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.css',
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') memberForm?: NgForm;
  private accountService = inject(AccountService);
  private memberService = inject(MemberService);
  private toastr = inject(ToastrService);
  member?: Member;

  @HostListener('window:beforeunload', ['$event']) notify($event: any) {
    if (this.memberForm?.dirty) {
      $event.returnValue = true;
    }
  }

  ngOnInit(): void {
    this.getMember();
  }

  getMember() {
    const user = this.accountService.currentUser();
    if (!user) return;

    this.memberService.getMember(user.username).subscribe((member) => {
      this.member = member;
    });
  }

  updateMember() {
    this.memberService.updateMember(this.member!).subscribe({
      next: _ => {
        this.toastr.success('Profile updated successfully');
        this.memberForm?.reset(this.member);
      },
    });
  }
}
