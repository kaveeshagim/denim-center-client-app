import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Corder} from "../entity/corder";


@Injectable({
  providedIn: 'root'
})

export class CorderService {
  constructor(private http: HttpClient) { }

  async update(corder: Corder): Promise<[]|undefined>{
    //console.log("Corder Updating-"+JSON.stringify(corder));
    return this.http.put<[]>('http://localhost:8080/corders', corder).toPromise();
  }

  async getAll(query:string): Promise<Array<Corder>> {

    const corders = await this.http.get<Array<Corder>>('http://localhost:8080/corders'+query).toPromise();
    if(corders == undefined){
      return [];
    }
    return corders;
  }

  async add(corder: Corder): Promise<[]|undefined>{
    //console.log("Corder Adding-"+JSON.stringify(corder));
    return this.http.post<[]>('http://localhost:8080/corders', corder).toPromise();
  }

  async getAllList(): Promise<Array<Corder>> {

    const corders = await this.http.get<Array<Corder>>('http://localhost:8080/corders/list').toPromise();
    if(corders == undefined){
      return [];
    }
    return corders;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/corders/' + id).toPromise();
  }

}
