import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Privilege} from "../entity/privilege";



@Injectable({
  providedIn: 'root'
})

export class PrivilegeService {
  constructor(private http: HttpClient) { }

  async update(privilege: Privilege): Promise<[]|undefined>{
    //console.log("Privilege Updating-"+JSON.stringify(privilege));
    return this.http.put<[]>('http://localhost:8080/privileges', privilege).toPromise();
  }

  async getAll(query:string): Promise<Array<Privilege>> {

    const privileges = await this.http.get<Array<Privilege>>('http://localhost:8080/privileges'+query).toPromise();
    if(privileges == undefined){
      return [];
    }
    return privileges;
  }

  async add(privilege: Privilege): Promise<[]|undefined>{
    //console.log("Privilege Adding-"+JSON.stringify(privilege));
    return this.http.post<[]>('http://localhost:8080/privileges', privilege).toPromise();
  }

  async getAllList(): Promise<Array<Privilege>> {

    const privileges = await this.http.get<Array<Privilege>>('http://localhost:8080/privileges/list').toPromise();
    if(privileges == undefined){
      return [];
    }
    return privileges;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/privileges/' + id).toPromise();
  }

}
