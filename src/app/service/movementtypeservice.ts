import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Movementtype} from "../entity/movementtype";

@Injectable({
  providedIn: 'root'
})

export class MovementtypeService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Movementtype>> {

    const movementtypes = await this.http.get<Array<Movementtype>>('http://localhost:8080/movementtypes/list').toPromise();
    if(movementtypes == undefined){
      return [];
    }
    return movementtypes;
  }
}
