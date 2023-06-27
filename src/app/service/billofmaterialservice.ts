import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Billofmaterial} from "../entity/billofmaterial";


@Injectable({
  providedIn: 'root'
})

export class BillofmaterialService {
  constructor(private http: HttpClient) { }

  async update(billofmaterial: Billofmaterial): Promise<[]|undefined>{
    //console.log("Billofmaterial Updating-"+JSON.stringify(billofmaterial));
    return this.http.put<[]>('http://localhost:8080/billofmaterials', billofmaterial).toPromise();
  }

  async getAll(query:string): Promise<Array<Billofmaterial>> {

    const billofmaterials = await this.http.get<Array<Billofmaterial>>('http://localhost:8080/billofmaterials'+query).toPromise();
    if(billofmaterials == undefined){
      return [];
    }
    return billofmaterials;
  }

  async add(billofmaterial: Billofmaterial): Promise<[]|undefined>{
    //console.log("Billofmaterial Adding-"+JSON.stringify(billofmaterial));
    return this.http.post<[]>('http://localhost:8080/billofmaterials', billofmaterial).toPromise();
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/billofmaterials/' + id).toPromise();
  }

}
