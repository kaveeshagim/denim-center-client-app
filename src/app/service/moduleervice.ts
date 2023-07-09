import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Module} from "../entity/module";

@Injectable({
  providedIn: 'root'
})

export class ModuleService {
  constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Module>> {

    const modules = await this.http.get<Array<Module>>('http://localhost:8080/modules/list').toPromise();
    if(modules == undefined){
      return [];
    }
    return modules;
  }
}
