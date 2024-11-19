import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Member } from '../models/member.model';
import { PaginatedResult } from '../models/pagination.model';
import { createHttpParams, setPaginatedResult } from './pagination.helper';

@Injectable({
  providedIn: 'root',
})
export class LikesService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  likeIds = signal<number[]>([]);
  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);

  toggleLike(targetId: number) {
    return this.http.post(this.baseUrl + 'likes/' + targetId, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {
    let params = createHttpParams(pageNumber, pageSize);

    params = params.append('predicate', predicate);

    return this.http
      .get<Member[]>(this.baseUrl + 'likes', { observe: 'response', params })
      .subscribe({
        next: (response) => {
          setPaginatedResult(response, this.paginatedResult);
        },
      });
  }

  getLikeIds() {
    return this.http
      .get<number[]>(this.baseUrl + 'likes/list')
      .subscribe((ids) => {
        this.likeIds.set(ids);
      });
  }
}
