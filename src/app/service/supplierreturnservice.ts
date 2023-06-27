import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Supplierreturn} from "../entity/supplierreturn";

@Injectable({
  providedIn: 'root'
})

export class SupplierreturnService {
  constructor(private http: HttpClient) { }

  async update(supplierreturn: Supplierreturn): Promise<[]|undefined>{
    //console.log("Supplierreturn Updating-"+JSON.stringify(supplierreturn));
    return this.http.put<[]>('http://localhost:8080/supplierreturns', supplierreturn).toPromise();
  }

  async getAll(query:string): Promise<Array<Supplierreturn>> {

    const supplierreturns = await this.http.get<Array<Supplierreturn>>('http://localhost:8080/supplierreturns'+query).toPromise();
    if(supplierreturns == undefined){
      return [];
    }
    return supplierreturns;
  }

  async add(supplierreturn: Supplierreturn): Promise<[]|undefined>{
    //console.log("Supplierreturn Adding-"+JSON.stringify(supplierreturn));
    return this.http.post<[]>('http://localhost:8080/supplierreturns', supplierreturn).toPromise();
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/supplierreturns/' + id).toPromise();
  }

}
