import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Product} from "../entity/product";

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  constructor(private http: HttpClient) { }

  // Updates the product
  async update(product: Product): Promise<[]|undefined>{
    return this.http.put<[]>('http://localhost:8080/products', product).toPromise();
  }

  // Retrieves all products based on the provided query
  async getAll(query:string): Promise<Array<Product>> {

    const products = await this.http.get<Array<Product>>('http://localhost:8080/products'+query).toPromise();
    if(products == undefined){
      return [];
    }
    return products;
  }

  // Adds a new product
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
