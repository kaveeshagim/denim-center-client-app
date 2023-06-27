import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Supplier} from "../entity/supplier";


@Injectable({
  providedIn: 'root'
})

export class SupplierService {
  constructor(private http: HttpClient) { }

  async update(supplier: Supplier): Promise<[]|undefined>{
    //console.log("Supplier Updating-"+JSON.stringify(supplier));
    return this.http.put<[]>('http://localhost:8080/suppliers', supplier).toPromise();
  }

  async getAll(query:string): Promise<Array<Supplier>> {

    const suppliers = await this.http.get<Array<Supplier>>('http://localhost:8080/suppliers'+query).toPromise();
    if(suppliers == undefined){
      return [];
    }
    return suppliers;
  }

  async add(supplier: Supplier): Promise<[]|undefined>{
    //console.log("Supplier Adding-"+JSON.stringify(supplier));
    return this.http.post<[]>('http://localhost:8080/suppliers', supplier).toPromise();
  }

  async getAllList(): Promise<Array<Supplier>> {

    const suppliers = await this.http.get<Array<Supplier>>('http://localhost:8080/suppliers/list').toPromise();
    if(suppliers == undefined){
      return [];
    }
    return suppliers;
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/suppliers/' + id).toPromise();
  }

}
