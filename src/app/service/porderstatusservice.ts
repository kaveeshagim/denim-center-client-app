import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Porderstatus} from "../entity/porderstatus";

@Injectable({
  providedIn: 'root'
})

export class PorderstatusService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Porderstatus>> {

    const porderstatuses = await this.http.get<Array<Porderstatus>>('http://localhost:8080/porderstatuses/list').toPromise();
    if(porderstatuses == undefined){
      return [];
    }
    return porderstatuses;
  }
}
