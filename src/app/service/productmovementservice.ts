import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Productmovement} from "../entity/productmovement";

@Injectable({
  providedIn: 'root'
})

export class ProductmovementService {
  constructor(private http: HttpClient) { }

  async update(productmovement: Productmovement): Promise<[]|undefined>{
    //console.log("Productmovement Updating-"+JSON.stringify(productmovement));
    return this.http.put<[]>('http://localhost:8080/productmovements', productmovement).toPromise();
  }

  async getAll(query:string): Promise<Array<Productmovement>> {

    const productmovements = await this.http.get<Array<Productmovement>>('http://localhost:8080/productmovements'+query).toPromise();
    if(productmovements == undefined){
      return [];
    }
    return productmovements;
  }

  async add(productmovement: Productmovement): Promise<[]|undefined>{
    //console.log("Productmovement Adding-"+JSON.stringify(productmovement));
    return this.http.post<[]>('http://localhost:8080/productmovements', productmovement).toPromise();
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/productmovements/' + id).toPromise();
  }

}
