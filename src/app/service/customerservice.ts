import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Customer} from "../entity/customer";



@Injectable({
  providedIn: 'root'
})

export class CustomerService {
  constructor(private http: HttpClient) { }

  async update(customer: Customer): Promise<[]|undefined>{
    //console.log("Customer Updating-"+JSON.stringify(customer));
    return this.http.put<[]>('http://localhost:8080/customers', customer).toPromise();
  }

  async getAll(query:string): Promise<Array<Customer>> {

    const customers = await this.http.get<Array<Customer>>('http://localhost:8080/customers'+query).toPromise();
    if(customers == undefined){
      return [];
    }
    return customers;
  }

  async add(customer: Customer): Promise<[]|undefined>{
    //console.log("Customer Adding-"+JSON.stringify(customer));
    return this.http.post<[]>('http://localhost:8080/customers', customer).toPromise();
  }

  async getAllList(): Promise<Array<Customer>> {

    const customers = await this.http.get<Array<Customer>>('http://localhost:8080/customers/list').toPromise();
    if(customers == undefined){
      return [];
    }
    return customers;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/customers/' + id).toPromise();
  }

}
