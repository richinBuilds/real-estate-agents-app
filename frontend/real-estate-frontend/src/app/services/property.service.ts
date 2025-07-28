import { Injectable } from '@angular/core';
     import { HttpClient, HttpHeaders } from '@angular/common/http';
     import { Observable } from 'rxjs';
     import { map } from 'rxjs/operators';

     interface Property {
       _id: string;
       title: string;
       description: string;
       price: number;
       images?: string[];
       featured?: boolean;
       createdBy: { _id: string; firstName: string };
     }

     @Injectable({
       providedIn: 'root'
     })
     export class PropertyService {
       private apiUrl = 'http://localhost:5000/api/properties';
       private imageBaseUrl = 'http://localhost:5000';

       constructor(private http: HttpClient) {}

       getProperties(): Observable<Property[]> {
         return this.http.get<Property[]>(this.apiUrl).pipe(
           map((properties) => properties.map(property => ({
             ...property,
             images: property.images ? property.images.map((img: string) => `${this.imageBaseUrl}${img}`) : []
           })))
         );
       }

       getFeaturedProperties(): Observable<Property[]> {
        return this.http.get<Property[]>(`${this.apiUrl}/featured`).pipe(
          map((properties) => properties.map(property => ({
            ...property,
            images: property.images ? property.images.map((img: string) => `${this.imageBaseUrl}${img}`) : []
          })))
        );
      }
       

       

       getPropertyById(id: string): Observable<Property> {
         return this.http.get<Property>(`${this.apiUrl}/${id}`).pipe(
           map((property) => ({
             ...property,
             images: property.images ? property.images.map((img: string) => `${this.imageBaseUrl}${img}`) : []
           }))
         );
       }

       addProperty(formData: FormData): Observable<any> {
         const token = localStorage.getItem('token');
         const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
         return this.http.post(this.apiUrl, formData, { headers });
       }

       updateProperty(id: string, formData: FormData): Observable<any> {
         const token = localStorage.getItem('token');
         const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
         return this.http.put(`${this.apiUrl}/${id}`, formData, { headers });
       }

       deleteProperty(id: string): Observable<any> {
         const token = localStorage.getItem('token');
         const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
         return this.http.delete(`${this.apiUrl}/${id}`, { headers });
       }
       
     }