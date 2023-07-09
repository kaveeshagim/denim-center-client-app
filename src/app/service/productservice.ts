import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Product} from "../entity/product";
import {TokenStorageService} from "../view/services/token-storage.service";

@Injectable({
  providedIn: 'root'
})
//interacts with an API to perform CRUD (Create, Read, Update, Delete) operations on products
export class ProductService {
  constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) { }
  // HttpClient used to make HTTP requests to the API.

  // Updates the product. returns a Promise that resolves to an array ([]) or undefined.
  async update(product: Product): Promise<[]|undefined>{
    return this.http.put<[]>('http://localhost:8080/products', product).toPromise();
  }

  // Retrieves all products based on the provided query
  async getAll(query: string): Promise<Array<Product>> {
    const authToken = this.tokenStorageService.getToken();
    //sets the Authorization header with the token if it exists.
    let headers = new HttpHeaders();
    if (authToken) {
      headers = headers.set('Authorization', 'Bearer ' + authToken);
    }

    const products = await this.http.get<Array<Product>>('http://localhost:8080/products' + query, { headers }).toPromise();
    if (products == undefined) {
      return [];
    }
    return products;
  }

  // Adds a new product.  sends an HTTP POST request to the specified URL (http://localhost:8080/products)
  // with the new product data and returns the response as a promise.
  async add(product: Product): Promise<[]|undefined>{
    return this.http.post<[]>('http://localhost:8080/products', product).toPromise();
  }

  // Retrieves all products as a list
  async getAllList(): Promise<Array<Product>> {

    const products = await this.http.get<Array<Product>>('http://localhost:8080/products/list').toPromise();
    if(products == undefined){
      return [];
    }
    return products;
  }

  // Deletes a product based on the provided ID
  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/products/' + id).toPromise();
  }

}
