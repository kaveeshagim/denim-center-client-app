import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Type} from "../entity/type";

@Injectable({
  providedIn: 'root'
})

export class TypeService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Type>> {

    const types = await this.http.get<Array<Type>>('http://localhost:8080/types/list').toPromise();
    if(types == undefined){
      return [];
    }
    return types;
  }
}
