import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {User} from "../entity/user";

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

}
