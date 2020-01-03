import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Subject, BehaviorSubject } from 'rxjs';
import { Users } from './user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({
    providedIn: 'root'
})


export class AuthService {
    user = new BehaviorSubject<Users>(null);
    private tokenExpirationTimer: any;
   
    
    constructor (private http: HttpClient, private router: Router) {}

    signUp(email: string, password: string ) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
        {
            email: email,
            password: password,
            returnSecureToken: true
        }
      ).pipe(catchError(this.handleError), tap(resData => {
          this.handleAuthentication(
              resData.email,
              resData.idToken, 
              resData.localId, 
              +resData.expiresIn
          );
        })
      );
    }

    autoLogin() {
       const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: string;
       } = JSON.parse(localStorage.getItem('userData'));
       if(!userData) {
           return;
       }

       const loadedUser = new Users(
           userData.email, 
           userData.id, 
           userData._token, 
           new Date(userData._tokenExpirationDate)
           );

           if(loadedUser.token) {
               this.user.next(loadedUser);
               const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
               this.autoLogout(expirationDuration)
           }

    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey, 
        {
            email: email,
            password: password,
            returnSecureToken: true
        }
      ).pipe(catchError(this.handleError), tap(resData => {
        this.handleAuthentication(
            resData.email,
            resData.idToken, 
            resData.localId, 
            +resData.expiresIn
        );
      }));
    }

    logout() {
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        if(this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationDuration: number) {
        console.log(expirationDuration);
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    private handleAuthentication(email: string, token: string, userId: string, expiresIn: number) {

        const expirationDate = new Date(
            new Date().getTime() + 
            + expiresIn * 1000);
        const user = new Users(
                    email,
                    userId,
                    token,
                    expirationDate);

        this.user.next(user);
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(errorRes: HttpErrorResponse) {
        let error = '';

        if (!errorRes.error || !errorRes.error.error) {
            return throwError(error)
        }
 
         switch (errorRes.error.error.message) {
             case 'EMAIL_EXISTS':
                 error = 'Email Already Exisit';
                 break;
             case 'OPERATION_NOT_ALLOWED':
                 error = 'Invalid Credentials';
                 break;
             case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                 error = 'Too Many Attemps Try Later';
                 break;
             case 'EMAIL_NOT_FOUND':
                 error = 'Email Not Found';
                 break;
             case 'INVALID_PASSWORD':
                 error = 'Invalid Credentials';
                 break;
             case 'USER_DISABLED':
                 error = 'User Disable by Admin : (';
                 break;
             default:
                 error = 'An Error Occured Unknown';
 
         }
         return throwError(error) 
    }

}