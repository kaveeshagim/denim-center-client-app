import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class RegexService{
  constructor(private http: HttpClient) { }

  async get(type:string): Promise<[]> {
    const regexes = await this.http.get<[]>('http://localhost:8080/regexes/'+type).toPromise();

    if(regexes == undefined){
      return [];
    }
    return regexes;
  }
}
