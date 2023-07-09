import { Injectable } from '@angular/core';

//constant that holds the key for storing the token in the session storage.
const TOKEN_KEY = 'auth-token';
//constant that holds the key for storing the user information in the session storage.
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})

//responsible for managing the token and user information in the session storage
export class TokenStorageService {

  constructor() { }

  //clear the session storage, effectively signing out the user. It calls the clear method on the
  // window.sessionStorage object to remove all items from the session storage.
  signOut(): void {
    window.sessionStorage.clear();
  }

  // save the token to the session storage.
  // It takes a token parameter of type string and stores it in the session storage under the TOKEN_KEY.
  // Before saving the new token, it removes any existing token with the same key from the session storage.
  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  //retrieve the token from the session storage.
  //returns the token stored in the session storage under the TOKEN_KEY. If there is no token, it returns null.
  public getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  // save the user information to the session storage.
  // It takes a user parameter of any type and stores it as a JSON string in the session storage under the USER_KEY.
  // Before saving the new user information, it removes any existing user information with the same key from the session storage.
  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  //retrieve the user information from the session storage.
  // It retrieves the user information stored in the session storage under the USER_KEY as a JSON string.
  // If there is user information, it parses the JSON string and returns the corresponding JavaScript object.
  // If there is no user information, it returns an empty object ({}).
  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }
}
