import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Productinventory} from "../entity/productinventory";


@Injectable({
  providedIn: 'root'
})

export class ProductinventoryService {
  constructor(private http: HttpClient) { }

  async update(productinventory: Productinventory): Promise<[]|undefined>{
    //console.log("Productinventory Updating-"+JSON.stringify(productinventory));
    return this.http.put<[]>('http://localhost:8080/productinventories', productinventory).toPromise();
  }

  async getAll(query:string): Promise<Array<Productinventory>> {

    const productinventories = await this.http.get<Array<Productinventory>>('http://localhost:8080/productinventories'+query).toPromise();
    if(productinventories == undefined){
      return [];
    }
    return productinventories;
  }

  async add(productinventory: Productinventory): Promise<[]|undefined>{
    //console.log("Productinventory Adding-"+JSON.stringify(productinventory));
    return this.http.post<[]>('http://localhost:8080/productinventories', productinventory).toPromise();
  }

  async getAllList(): Promise<Array<Productinventory>> {

    const productinventories = await this.http.get<Array<Productinventory>>('http://localhost:8080/productinventories/list').toPromise();
    if(productinventories == undefined){
      return [];
    }
    return productinventories;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/productinventories/' + id).toPromise();
  }

}
