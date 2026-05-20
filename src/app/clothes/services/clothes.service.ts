import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreateClothingDTO, UpdateStatusDTO, UpdateClassificationDTO, ClothingItem } from '../interfaces/clothes.interface';

@Injectable({
  providedIn: 'root'
})
export class ClothesService {
  private apiUrl = `${environment.apiUrl}wei/clothes`;

  /** In-memory list for current user; avoids duplicate GET when carousel + armario share data */
  private clothesCache: ClothingItem[] | null = null;
  private clothesCacheUserId: string | null = null;

  constructor(private http: HttpClient) { }

  /** Clears GET cache (e.g. after POST upload) */
  invalidateClothesCache(): void {
    this.clothesCache = null;
    this.clothesCacheUserId = null;
  }

  /**
   * Returns cached clothes for same user_id if available; otherwise GET and store.
   */
  getCachedClothes(userId: string): Observable<ClothingItem[]> {
    if (this.clothesCacheUserId === userId && this.clothesCache !== null) {
      return of([...this.clothesCache]);
    }
    return this.getUserClothes(userId);
  }

  /**
   * multipart/form-data — do not set Content-Type manually (browser sets boundary).
   */
  uploadClothing(formData: FormData): Observable<ClothingItem> {
    return this.http.post<ClothingItem>(this.apiUrl, formData);
  }

  // Extract user id from token
  getUserIdFromToken(): string | null {
    if (
      typeof globalThis === 'undefined' ||
      !('localStorage' in globalThis) ||
      !globalThis.localStorage
    ) {
      return null;
    }
    const token = globalThis.localStorage.getItem('token');
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
    return this.http.get<ClothingItem[]>(`${this.apiUrl}?user_id=${userId}`).pipe(
      tap((items) => {
        this.clothesCacheUserId = userId;
        this.clothesCache = items;
      })
    );
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
