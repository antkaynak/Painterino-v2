import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor{

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const idToken = localStorage.getItem("id_token");
    console.log('interceptor');
    console.log(idToken);

    if (idToken) {
      const cloned = req.clone({
        headers: req.headers.set("x-auth", idToken)
      });

      return next.handle(cloned);
    }
    else {
      return next.handle(req);
    }
  }

}
