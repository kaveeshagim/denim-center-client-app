import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Agecategory} from "../entity/agecategory";


@Injectable({
  providedIn: 'root'
})

export class AgecategoryService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Agecategory>> {

    const agecategories = await this.http.get<Array<Agecategory>>('http://localhost:8080/agecategories/list').toPromise();
    if(agecategories == undefined){
      return [];
    }
    return agecategories;
  }
}
