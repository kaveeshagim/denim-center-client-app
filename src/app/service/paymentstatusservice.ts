import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Paymentstatus} from "../entity/paymentstatus";

@Injectable({
  providedIn: 'root'
})

export class PaymentstatusService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Paymentstatus>> {

    const paymentstatuses = await this.http.get<Array<Paymentstatus>>('http://localhost:8080/paymentstatuses/list').toPromise();
    if(paymentstatuses == undefined){
      return [];
    }
    return paymentstatuses;
  }
}
