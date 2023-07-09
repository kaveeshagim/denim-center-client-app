import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Role} from "../entity/role";

@Injectable({
  providedIn: 'root'
})

export class RoleService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Role>> {

    const roles = await this.http.get<Array<Role>>('http://localhost:8080/roles/list').toPromise();
    if(roles == undefined){
      return [];
    }
    return roles;
  }
}
