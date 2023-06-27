import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Gender} from "../entity/gender";

@Injectable({
  providedIn: 'root'
})

export class GenderService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Gender>> {

    const genders = await this.http.get<Array<Gender>>('http://localhost:8080/genders/list').toPromise();
    if(genders == undefined){
      return [];
    }
    return genders;
  }
}
