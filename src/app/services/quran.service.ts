import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, map } from 'rxjs';

export interface QuranPageResponse {
  code: number;
  status: string;
  data: {
    number: number;
    ayahs: Array<{
      number: number;
      text: string;
      numberInSurah: number;
      juz: number;
      hizbQuarter: number;
      sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
      surah: {
        number: number;
        name: string;
        englishName: string;
        englishNameTranslation: string;
        numberOfAyahs: number;
        revelationType: string;
      };
    }>;
    edition: {
      identifier: string;
      language: string;
      name: string;
      englishName: string;
      format: string;
      type: string;
    };
  };
}

export interface WordByWordResponse {
  code: number;
  status: string;
  data: {
    number: number;
    ayahs: Array<{
      number: number;
      text: string;
      numberInSurah: number;
      words?: Array<{
        id: number;
        position: number;
        audioUrl: string;
        charType: string;
        text: string;
        translation?: { text: string; language: string };
      }>;
      surah: {
        number: number;
        name: string;
        englishName: string;
        englishNameTranslation: string;
        numberOfAyahs: number;
        revelationType: string;
      };
    }>;
    edition: {
      identifier: string;
      language: string;
      name: string;
      englishName: string;
      format: string;
      type: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class QuranService {
  private http = inject(HttpClient);
  private baseUrl = 'https://api.alquran.cloud/v1/page';

  getPage(pageNumber: number): Observable<QuranPageResponse> {
    return this.http.get<QuranPageResponse>(`${this.baseUrl}/${pageNumber}`);
  }

  getPageWithWords(pageNumber: number): Observable<QuranPageResponse> {
    const textResponse = this.http.get<QuranPageResponse>(`${this.baseUrl}/${pageNumber}`);
    const wordsResponse = this.http.get<WordByWordResponse>(`${this.baseUrl}/${pageNumber}/words`);

    return combineLatest([textResponse, wordsResponse]).pipe(
      map(([textData, wordsData]) => {
        const mergedAyahs = textData.data.ayahs.map((ayah, index) => ({
          ...ayah,
          words: wordsData.data.ayahs[index]?.words || []
        }));
        return {
          ...textData,
          data: {
            ...textData.data,
            ayahs: mergedAyahs
          }
        };
      })
    );
  }
}
