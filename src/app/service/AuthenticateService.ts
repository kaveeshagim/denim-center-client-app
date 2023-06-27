import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {

  constructor(private http: HttpClient) {
  }

  async authenticate(username: string, password: string): Promise<any | undefined> {

    return this.http.post<any>("http://localhost/miserver/", {
      username: username,
      password: password,
      headers: {"Content-type": "application/x-www-form-urlencoded"}
    }).toPromise();

  }


}
