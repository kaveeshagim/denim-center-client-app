import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Empstatus} from "../entity/empstatus";

@Injectable({
  providedIn: 'root'
})

export class EmpstatusService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Empstatus>> {

    const empstatuses = await this.http.get<Array<Empstatus>>('http://localhost:8080/empstatuses/list').toPromise();
    if(empstatuses == undefined){
      return [];
    }
    return empstatuses;
  }
}
