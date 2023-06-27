import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Grn} from "../entity/grn";


@Injectable({
  providedIn: 'root'
})

export class GrnService {
  constructor(private http: HttpClient) { }

  async update(grn: Grn): Promise<[]|undefined>{
    //console.log("Grn Updating-"+JSON.stringify(grn));
    return this.http.put<[]>('http://localhost:8080/grns', grn).toPromise();
  }

  async getAll(query:string): Promise<Array<Grn>> {

    const grns = await this.http.get<Array<Grn>>('http://localhost:8080/grns'+query).toPromise();
    if(grns == undefined){
      return [];
    }
    return grns;
  }

  async add(grn: Grn): Promise<[]|undefined>{
    //console.log("Grn Adding-"+JSON.stringify(grn));
    return this.http.post<[]>('http://localhost:8080/grns', grn).toPromise();
  }

  async getAllList(): Promise<Array<Grn>> {

    const grns = await this.http.get<Array<Grn>>('http://localhost:8080/grns/list').toPromise();
    if(grns == undefined){
      return [];
    }
    return grns;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/grns/' + id).toPromise();
  }

}
