import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserStylePreferences } from '../interfaces/clothes.interface';

@Injectable({
  providedIn: 'root'
})
export class StylePreferencesService {
  private apiUrl = `${environment.apiUrl}wei/clothes/preferences`;

  constructor(private http: HttpClient) {}

  /**
   * GET /wei/clothes/preferences?user_id={sub}
   *
   * Returns UserStylePreferences.
   * 404 = no preferences yet — caller should guide user to save (PUT), not show error.
   */
  get(userId: string): Observable<UserStylePreferences> {
    return this.http.get<UserStylePreferences>(`${this.apiUrl}?user_id=${userId}`);
  }

  /**
   * PUT /wei/clothes/preferences?user_id={sub}
   *
   * Upserts style preferences. Send normalized lowercase strings for colors/seasons/occasions.
   * Returns saved UserStylePreferences.
   */
  save(userId: string, prefs: Partial<UserStylePreferences>): Observable<UserStylePreferences> {
    return this.http.put<UserStylePreferences>(`${this.apiUrl}?user_id=${userId}`, prefs);
  }
}
