import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Materialmovement} from "../entity/materialmovement";
import {Material} from "../entity/material";

@Injectable({
  providedIn: 'root'
})

export class MaterialmovementService {
  constructor(private http: HttpClient) { }

  async update(materialmovement: Materialmovement): Promise<[]|undefined>{
    //console.log("Materialmovement Updating-"+JSON.stringify(materialmovement));
    return this.http.put<[]>('http://localhost:8080/materialmovements', materialmovement).toPromise();
  }

  async getAll(query:string): Promise<Array<Materialmovement>> {

    const materialmovements = await this.http.get<Array<Materialmovement>>('http://localhost:8080/materialmovements'+query).toPromise();
    if(materialmovements == undefined){
      return [];
    }
    return materialmovements;
  }

  async add(materialmovement: Materialmovement): Promise<[]|undefined>{
    //console.log("Materialmovement Adding-"+JSON.stringify(materialmovement));
    return this.http.post<[]>('http://localhost:8080/materialmovements', materialmovement).toPromise();
  }

  async getAllList(): Promise<Array<Materialmovement>> {

    const materialmovements = await this.http.get<Array<Materialmovement>>('http://localhost:8080/materialmovements/list').toPromise();
    if(materialmovements == undefined){
      return [];
    }
    return materialmovements;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/materialmovements/' + id).toPromise();
  }

}
