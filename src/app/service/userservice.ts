import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {User} from "../entity/user";
import {Observable} from "rxjs";
import {TokenStorageService} from "../view/services/token-storage.service";

const API_URL = 'http://localhost:8080/api/test/';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  constructor(private http: HttpClient) { }

  async update(user: User): Promise<[]|undefined>{
    //console.log("User Updating-"+JSON.stringify(user));
    return this.http.put<[]>('http://localhost:8080/users', user).toPromise();
  }

  async getAll(query:string): Promise<Array<User>> {

    const users = await this.http.get<Array<User>>('http://localhost:8080/users'+query).toPromise();
    if(users == undefined){
      return [];
    }
    return users;
  }

  async add(user: User): Promise<[]|undefined>{
    //console.log("User Adding-"+JSON.stringify(user));
    return this.http.post<[]>('http://localhost:8080/users', user).toPromise();
  }

  async getAllList(): Promise<Array<User>> {

    const users = await this.http.get<Array<User>>('http://localhost:8080/users/list').toPromise();
    if(users == undefined){
      return [];
    }
    return users;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/users/' + id).toPromise();
  }

  baseUrl = 'http://localhost:8080/users';
  getUserRoles(userId: number): Promise<string[]|undefined> {
    return this.http.get<string[]>(`${this.baseUrl}/${userId}/roles`).toPromise();
  }

  addRolesToUser(userId: number, roles: string[]): Promise<any> {
    return this.http.post(`${this.baseUrl}/${userId}/roles`, roles).toPromise();
  }

  updateUserRoles(userId: number, roles: string[]): Promise<any> {
    return this.http.put(`${this.baseUrl}/${userId}/roles`, roles).toPromise();
  }

  removeRolesFromUser(userId: number, roles: string[]): Promise<any> {
    return this.http.request('delete', `${this.baseUrl}/${userId}/roles`, { body: roles }).toPromise();
  }
  getPublicContent(): Observable<any> {
    return this.http.get(API_URL + 'all', { responseType: 'text' });
  }

  getManagerBoard(): Observable<any> {
    return this.http.get(API_URL + 'manager', { responseType: 'text' });
  }

  getExecutiveBoard(): Observable<any> {
    return this.http.get(API_URL + 'executive', { responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(API_URL + 'admin', { responseType: 'text' });
  }
}
