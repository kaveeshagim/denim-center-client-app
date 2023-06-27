import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Material} from "../entity/material";


@Injectable({
  providedIn: 'root'
})

export class MaterialService {
  constructor(private http: HttpClient) { }

  async update(material: Material): Promise<[]|undefined>{
    //console.log("Material Updating-"+JSON.stringify(material));
    return this.http.put<[]>('http://localhost:8080/materials', material).toPromise();
  }

  async getAll(query:string): Promise<Array<Material>> {

    const materials = await this.http.get<Array<Material>>('http://localhost:8080/materials'+query).toPromise();
    if(materials == undefined){
      return [];
    }
    return materials;
  }

  async add(material: Material): Promise<[]|undefined>{
    //console.log("Material Adding-"+JSON.stringify(material));
    return this.http.post<[]>('http://localhost:8080/materials', material).toPromise();
  }

  async getAllList(): Promise<Array<Material>> {

    const materials = await this.http.get<Array<Material>>('http://localhost:8080/materials/list').toPromise();
    if(materials == undefined){
      return [];
    }
    return materials;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/materials/' + id).toPromise();
  }

}
