import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Productionorder} from "../entity/productionorder";

@Injectable({
  providedIn: 'root'
})

export class ProductionorderService {
  constructor(private http: HttpClient) { }

  async update(productionorder: Productionorder): Promise<[]|undefined>{
    //console.log("Productionorder Updating-"+JSON.stringify(productionorder));
    return this.http.put<[]>('http://localhost:8080/productionorders', productionorder).toPromise();
  }

  async getAll(query:string): Promise<Array<Productionorder>> {

    const productionorders = await this.http.get<Array<Productionorder>>('http://localhost:8080/productionorders'+query).toPromise();
    if(productionorders == undefined){
      return [];
    }
    return productionorders;
  }

  async add(productionorder: Productionorder): Promise<[]|undefined>{
    //console.log("Productionorder Adding-"+JSON.stringify(productionorder));
    return this.http.post<[]>('http://localhost:8080/productionorders', productionorder).toPromise();
  }

  async getAllList(): Promise<Array<Productionorder>> {

    const productionorders = await this.http.get<Array<Productionorder>>('http://localhost:8080/productionorders/list').toPromise();
    if(productionorders == undefined){
      return [];
    }
    return productionorders;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/productionorders/' + id).toPromise();
  }

}
