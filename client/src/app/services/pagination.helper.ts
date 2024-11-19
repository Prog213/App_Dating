import { HttpParams, HttpResponse } from '@angular/common/http';
import { signal, Signal } from '@angular/core';
import { PaginatedResult } from '../models/pagination.model';

export function setPaginatedResult<T>(
  response: HttpResponse<T>,
  paginatedResult: ReturnType<typeof signal<PaginatedResult<T> | null>>
) {
  paginatedResult.set({
    items: response.body as T,
    pagination: JSON.parse(response.headers.get('Pagination')!),
  });
}

export function createHttpParams(page?: number, itemsPerPage?: number) {
  let params = new HttpParams();

  if (page && itemsPerPage) {
    params = params.append('pageNumber', page);
    params = params.append('pageSize', itemsPerPage);
  }
  return params;
}
