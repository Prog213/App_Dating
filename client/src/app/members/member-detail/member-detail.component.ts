import { Component, inject, input, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member.model';
import { DatePipe } from '@angular/common';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [DatePipe, TabsModule, GalleryModule],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css',
})
export class MemberDetailComponent implements OnInit {
  private memberService = inject(MemberService);
  member?: Member;
  username = input.required<string>();
  images: GalleryItem[] = [];

  ngOnInit(): void {
    this.memberService.getMember(this.username()).subscribe((member) => {
      this.member = member;
      member.photos.map((photo) => {
        this.images.push(
          new ImageItem({
            src: photo.url,
            thumb: photo.url,
          })
        );
      });
    });
  }
}
