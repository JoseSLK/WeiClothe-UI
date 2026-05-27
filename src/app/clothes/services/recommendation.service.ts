import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OutfitRecommendation, RecommendationParams } from '../interfaces/clothes.interface';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = `${environment.apiUrl}wei/clothes/recommendations`;
  private cache = new Map<string, OutfitRecommendation[]>();

  constructor(private http: HttpClient) {}

  clearCache(): void {
    this.cache.clear();
  }

  /**
   * GET /wei/clothes/recommendations?user_id=&season=&occasion=&limit=
   *
   * Returns OutfitRecommendation[] (empty array when insufficient garments).
   * Only garments with status === "completed" participate.
   */
  getRecommendations(params: RecommendationParams): Observable<OutfitRecommendation[]> {
    const cacheKey = `${params.user_id}-${params.season || 'all'}-${params.occasion || 'all'}-${params.limit || 0}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    let httpParams = new HttpParams().set('user_id', params.user_id);

    if (params.season) {
      httpParams = httpParams.set('season', params.season);
    }
    if (params.occasion) {
      httpParams = httpParams.set('occasion', params.occasion);
    }
    if (params.limit && params.limit > 0) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<OutfitRecommendation[]>(this.apiUrl, { params: httpParams }).pipe(
      tap(data => this.cache.set(cacheKey, data))
    );
  }
}
