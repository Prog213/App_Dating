import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable, model, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../models/member.model';
import { of, tap } from 'rxjs';
import { Photo } from '../models/photo.model';
import { PaginatedResult } from '../models/pagination.model';
import { UserParams } from '../models/userParams.model';
import { AccountService } from './account.service';
import { createHttpParams, setPaginatedResult } from './pagination.helper';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  userParams = signal<UserParams>(new UserParams(this.accountService.currentUser()));
  baseUrl = environment.apiUrl;
  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);
  cashedMembers = new Map();

  getMembers() {
    const response = this.cashedMembers.get(
      Object.values(this.userParams()).join('-')
    );

    if (response) {
      return setPaginatedResult(response, this.paginatedResult);
    }

    let params = createHttpParams(
      this.userParams().pageNumber,
      this.userParams().pageSize
    );

    params = params.append('minAge', this.userParams().minAge);
    params = params.append('maxAge', this.userParams().maxAge);
    params = params.append('gender', this.userParams().gender);
    params = params.append('orderBy', this.userParams().orderBy);

    return this.http
      .get<Member[]>(this.baseUrl + 'users', { observe: 'response', params })
      .subscribe((response) => {
        setPaginatedResult(response, this.paginatedResult);
        this.cashedMembers.set(Object.values(this.userParams()).join('-'), response);
      });
  }

  getMember(username: string) {
    const member : Member = [...this.cashedMembers.values()].reduce(
      (arr, elem) => arr.concat(elem.body),[]
    ).find((m: Member) => m.userName === username);

    if (member) {
      return of(member);
    }
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  resetFilters() {
    this.userParams.set(new UserParams(this.accountService.currentUser()));
  }

  updateMember(member: Member) {
    return this.http
      .put(this.baseUrl + 'users', member)
      .pipe
      // tap(() => {
      //   this.members.update((members) =>
      //     members.map((m) => (m.userName === member.userName ? member : m))
      //   );
      // })
      ();
  }

  setMainPhoto(photo: Photo) {
    return this.http
      .put(this.baseUrl + 'users/set-main-photo/' + photo.id, {})
      .pipe
      // tap(() => {
      //   this.members.update((members) =>
      //     members.map((m) => {
      //       if (m.photos.includes(photo)) {
      //         m.photoUrl = photo.url;
      //       }
      //       return m;
      //     })
      //   );
      // })
      ();
  }

  deletePhoto(photo: Photo) {
    return this.http
      .delete(this.baseUrl + 'users/delete-photo/' + photo.id)
      .pipe
      // tap(() => {
      //   this.members.update((members) =>
      //     members.map((m) => {
      //       m.photos = m.photos.filter((p) => p.id !== photo.id);
      //       return m;
      //     })
      //   );
      // })
      ();
  }
}
