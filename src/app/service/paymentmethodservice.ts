import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Paymentmethod} from "../entity/paymentmethod";

@Injectable({
  providedIn: 'root'
})

export class PaymentmethodService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Paymentmethod>> {

    const paymentmethods = await this.http.get<Array<Paymentmethod>>('http://localhost:8080/paymentmethods/list').toPromise();
    if(paymentmethods == undefined){
      return [];
    }
    return paymentmethods;
  }
}
