import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err) => {
      switch (err.status) {
        case 400:
          if (err.error.errors) {
            const modalStateErrors = [];
            for (const key in err.error.errors) {
              if (err.error.errors[key]) {
                modalStateErrors.push(err.error.errors[key]);
              }
            }
            throw modalStateErrors.flat();
          } else {
            toastr.error(err.error, err.status);
          }
          break;
        case 401:
          toastr.error("Unauthorized", err.status);
          break;
        case 404:
          router.navigateByUrl('/not-found');
          break;
        case 500:
          const navigationExtras: NavigationExtras = { state: { error: err.error } };
          router.navigateByUrl('/server-error', navigationExtras);
          break;
        default:
          toastr.error("Something went wrong");
          break;
      }
      throw err;
    })
  );
};