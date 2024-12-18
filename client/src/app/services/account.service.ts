import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesService } from './likes.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private httpClient = inject(HttpClient);
  private likeService = inject(LikesService);
  private baseUrl = environment.apiUrl;
  currentUser = signal<User | null>(null);
  roles = computed(() => {
    const user = this.currentUser();
    if (user && user.token) {
      const decodedToken = JSON.parse(atob(user.token.split('.')[1])).role;
      return Array.isArray(decodedToken) ? decodedToken : [decodedToken];
    }

    return [];
  });

  login(model: any) {
    return this.httpClient
      .post<User>(this.baseUrl + 'account/login', model)
      .pipe(
        map((user) => {
          if (user) {
            this.setCurrentUser(user);
          }
        })
      );
  }

  register(model: any) {
    return this.httpClient
      .post<User>(this.baseUrl + 'account/register', model)
      .pipe(
        map((user) => {
          if (user) {
            this.setCurrentUser(user);
          }
          return user;
        })
      );
  }

  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.likeService.getLikeIds();
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }
}
