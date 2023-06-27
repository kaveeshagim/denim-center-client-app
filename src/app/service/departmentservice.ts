import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Department} from "../entity/department";

@Injectable({
  providedIn: 'root'
})

export class DepartmentService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Department>> {

    const departments = await this.http.get<Array<Department>>('http://localhost:8080/departments/list').toPromise();
    if(departments == undefined){
      return [];
}
    return departments;
}
}
