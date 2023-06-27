import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Customerpayment} from "../entity/customerpayment";

@Injectable({
  providedIn: 'root'
})

export class CustomerpaymentService {
  constructor(private http: HttpClient) { }

  async update(customerpayment: Customerpayment): Promise<[]|undefined>{
    //console.log("Customerpayment Updating-"+JSON.stringify(customerpayment));
    return this.http.put<[]>('http://localhost:8080/customerpayments', customerpayment).toPromise();
  }

  async getAll(query:string): Promise<Array<Customerpayment>> {

    const customerpayments = await this.http.get<Array<Customerpayment>>('http://localhost:8080/customerpayments'+query).toPromise();
    if(customerpayments == undefined){
      return [];
    }
    return customerpayments;
  }

  async add(customerpayment: Customerpayment): Promise<[]|undefined>{
    //console.log("Customerpayment Adding-"+JSON.stringify(customerpayment));
    return this.http.post<[]>('http://localhost:8080/customerpayments', customerpayment).toPromise();
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/customerpayments/' + id).toPromise();
  }

}
