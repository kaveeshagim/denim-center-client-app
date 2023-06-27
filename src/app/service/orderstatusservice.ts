import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Orderstatus} from "../entity/orderstatus";

@Injectable({
  providedIn: 'root'
})

export class OrderstatusService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Orderstatus>> {

    const orderstatuses = await this.http.get<Array<Orderstatus>>('http://localhost:8080/orderstatuses/list').toPromise();
    if(orderstatuses == undefined){
      return [];
    }
    return orderstatuses;
  }
}
