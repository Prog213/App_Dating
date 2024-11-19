import { Component, inject, OnInit } from '@angular/core';
import { LikesService } from '../services/likes.service';
import { Member } from '../models/member.model';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { FormsModule } from '@angular/forms';
import { MemberCardComponent } from '../members/member-card/member-card.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [ButtonsModule, FormsModule, MemberCardComponent, PaginationModule],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.css',
})
export class ListsComponent implements OnInit {
  private likeService = inject(LikesService);
  members = this.likeService.paginatedResult.asReadonly();
  predicate = 'liked';
  pageNumber = 1;
  pageSize = 5;

  ngOnInit() {
    this.loadLikes();
  }

  getTitle() {
    switch (this.predicate) {
      case 'liked':
        return 'Members you like';
      case 'likedBy':
        return 'Members who like you';
      default:
        return 'Mutual likes';
    }
  }

  loadLikes() {
    this.likeService.getLikes(this.predicate, this.pageNumber, this.pageSize);
  }

  pageChanged(event: any) {
    if (this.pageNumber !== event.page) {
      this.pageNumber = event.page;
      this.loadLikes();
    }
  }
}
