import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Size} from "../entity/size";

@Injectable({
  providedIn: 'root'
})

export class SizeService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Size>> {

    const sizes = await this.http.get<Array<Size>>('http://localhost:8080/sizes/list').toPromise();
    if(sizes == undefined){
      return [];
    }
    return sizes;
  }
}
