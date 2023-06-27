import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Porder} from "../entity/porder";


@Injectable({
  providedIn: 'root'
})

export class PorderService {
  constructor(private http: HttpClient) { }

  async update(porder: Porder): Promise<[]|undefined>{
    //console.log("Porder Updating-"+JSON.stringify(porder));
    return this.http.put<[]>('http://localhost:8080/porders', porder).toPromise();
  }

  async getAll(query:string): Promise<Array<Porder>> {

    const porders = await this.http.get<Array<Porder>>('http://localhost:8080/porders'+query).toPromise();
    if(porders == undefined){
      return [];
    }
    return porders;
  }

  async add(porder: Porder): Promise<[]|undefined>{
    //console.log("Porder Adding-"+JSON.stringify(porder));
    return this.http.post<[]>('http://localhost:8080/porders', porder).toPromise();
  }

  async getAllList(): Promise<Array<Porder>> {

    const porders = await this.http.get<Array<Porder>>('http://localhost:8080/porders/list').toPromise();
    if(porders == undefined){
      return [];
    }
    return porders;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/porders/' + id).toPromise();
  }

}
