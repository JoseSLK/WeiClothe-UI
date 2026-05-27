import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OutfitRecommendation, RecommendationParams } from '../interfaces/clothes.interface';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = `${environment.apiUrl}wei/clothes/recommendations`;

  constructor(private http: HttpClient) {}

  /**
   * GET /wei/clothes/recommendations?user_id=&season=&occasion=&limit=
   *
   * Returns OutfitRecommendation[] (empty array when insufficient garments).
   * Only garments with status === "completed" participate.
   */
  getRecommendations(params: RecommendationParams): Observable<OutfitRecommendation[]> {
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

    return this.http.get<OutfitRecommendation[]>(this.apiUrl, { params: httpParams });
  }
}
