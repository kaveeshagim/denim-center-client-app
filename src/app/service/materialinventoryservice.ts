import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Materialinventory} from "../entity/materialinventory";
import {Materialmovement} from "../entity/materialmovement";

@Injectable({
  providedIn: 'root'
})

export class MaterialinventoryService {
  constructor(private http: HttpClient) { }

  async update(materialinventory: Materialinventory): Promise<[]|undefined>{
    //console.log("Materialinventory Updating-"+JSON.stringify(materialinventory));
    return this.http.put<[]>('http://localhost:8080/materialinventories', materialinventory).toPromise();
  }

  async getAll(query:string): Promise<Array<Materialinventory>> {

    const materialinventories = await this.http.get<Array<Materialinventory>>('http://localhost:8080/materialinventories'+query).toPromise();
    if(materialinventories == undefined){
      return [];
    }
    return materialinventories;
  }

  async add(materialinventory: Materialinventory): Promise<[]|undefined>{
    //console.log("Materialinventory Adding-"+JSON.stringify(materialinventory));
    return this.http.post<[]>('http://localhost:8080/materialinventories', materialinventory).toPromise();
  }

  async getAllList(): Promise<Array<Materialinventory>> {

    const materialinventories = await this.http.get<Array<Materialinventory>>('http://localhost:8080/materialinventories/list').toPromise();
    if(materialinventories == undefined){
      return [];
    }
    return materialinventories;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/materialinventories/' + id).toPromise();
  }

}
