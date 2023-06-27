import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Customerreturn} from "../entity/customerreturn";

@Injectable({
  providedIn: 'root'
})

export class CustomerreturnService {
  constructor(private http: HttpClient) { }

  async update(customerreturn: Customerreturn): Promise<[]|undefined>{
    //console.log("Customerreturn Updating-"+JSON.stringify(customerreturn));
    return this.http.put<[]>('http://localhost:8080/customerreturns', customerreturn).toPromise();
  }

  async getAll(query:string): Promise<Array<Customerreturn>> {

    const customerreturns = await this.http.get<Array<Customerreturn>>('http://localhost:8080/customerreturns'+query).toPromise();
    if(customerreturns == undefined){
      return [];
    }
    return customerreturns;
  }

  async add(customerreturn: Customerreturn): Promise<[]|undefined>{
    //console.log("Customerreturn Adding-"+JSON.stringify(customerreturn));
    return this.http.post<[]>('http://localhost:8080/customerreturns', customerreturn).toPromise();
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/customerreturns/' + id).toPromise();
  }

}
