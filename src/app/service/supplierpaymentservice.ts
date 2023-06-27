import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Supplierpayment} from "../entity/supplierpayment";

@Injectable({
  providedIn: 'root'
})

export class SupplierpaymentService {
  constructor(private http: HttpClient) { }

  async update(supplierpayment: Supplierpayment): Promise<[]|undefined>{
    //console.log("Supplierpayment Updating-"+JSON.stringify(supplierpayment));
    return this.http.put<[]>('http://localhost:8080/supplierpayments', supplierpayment).toPromise();
  }

  async getAll(query:string): Promise<Array<Supplierpayment>> {

    const supplierpayments = await this.http.get<Array<Supplierpayment>>('http://localhost:8080/supplierpayments'+query).toPromise();
    if(supplierpayments == undefined){
      return [];
    }
    return supplierpayments;
  }

  async add(supplierpayment: Supplierpayment): Promise<[]|undefined>{
    //console.log("Supplierpayment Adding-"+JSON.stringify(supplierpayment));
    return this.http.post<[]>('http://localhost:8080/supplierpayments', supplierpayment).toPromise();
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/supplierpayments/' + id).toPromise();
  }

}
