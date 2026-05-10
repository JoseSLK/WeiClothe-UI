import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateClothingDTO, UpdateStatusDTO, UpdateClassificationDTO, ClothingItem } from '../interfaces/clothes.interface';

@Injectable({
  providedIn: 'root'
})
export class ClothesService {
  private apiUrl = `${environment.apiUrl}wei/clothes`;

  constructor(private http: HttpClient) { }

  // Extract user id from token
  getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const decodedData = JSON.parse(decodedJson);

      // Support multiple conventions of JWT claimss
      return decodedData.sub || decodedData.user_id || decodedData.id || null;
    } catch (e) {
      console.error('Error al decodificar el token JWT', e);
      return null;
    }
  }

  ping(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ping`);
  }

  createClothing(data: CreateClothingDTO): Observable<ClothingItem> {
    return this.http.post<ClothingItem>(this.apiUrl, data);
  }

  getUserClothes(userId: string): Observable<ClothingItem[]> {
    return this.http.get<ClothingItem[]>(`${this.apiUrl}?user_id=${userId}`);
  }

  getClothingById(id: string): Observable<ClothingItem> {
    return this.http.get<ClothingItem>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, data: UpdateStatusDTO): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, data);
  }

  updateClassification(id: string, data: UpdateClassificationDTO): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/classification`, data);
  }
}
