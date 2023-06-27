import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Color} from "../entity/color";

@Injectable({
  providedIn: 'root'
})

export class ColorService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Color>> {

    const colors = await this.http.get<Array<Color>>('http://localhost:8080/colors/list').toPromise();
    if(colors == undefined){
      return [];
    }
    return colors;
  }
}
