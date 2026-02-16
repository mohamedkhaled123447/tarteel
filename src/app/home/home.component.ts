import { Component, OnInit, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { QuranService } from '../services/quran.service';

@Component({
  selector: 'app-home',
  imports: [ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private quranService = inject(QuranService);
  title = 'Welcome to Tarteel';
  ayahs = signal<any[]>([]);
  pageNumber = signal(1);
  isLoading = signal(false);
  displayMode = signal<'ayah' | 'word' | null>(null);
  currentAyahIndex = signal(0);
  currentWordIndex = signal(0);
  revealedAyahs = signal<number[]>([]);

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(pageNumber: number): void {
    this.isLoading.set(true);
    this.currentAyahIndex.set(0);
    this.currentWordIndex.set(0);
    this.revealedAyahs.set([]);
    this.displayMode.set("ayah");
    this.quranService.getPageWithWords(pageNumber).subscribe({
      next: (data) => {
        this.ayahs.set(data.data.ayahs);
        this.pageNumber.set(pageNumber);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
      }
    });
  }

  nextPage(): void {
    this.loadPage(this.pageNumber() + 1);
  }

  previousPage(): void {
    if (this.pageNumber() > 1) {
      this.loadPage(this.pageNumber() - 1);
    }
  }


  revealNextAyah(): void {
    if (this.currentAyahIndex() < this.ayahs().length ) {
       this.revealedAyahs.update(arr => [...arr, this.currentAyahIndex()]);
      const nextIndex = this.currentAyahIndex() + 1;
      this.currentAyahIndex.set(nextIndex);
      this.currentWordIndex.set(0);
    }else{
      this.nextPage();
    }
  }

  revealPreviousAyah(): void {
    if (this.currentAyahIndex() > 0) {
    this.revealedAyahs.update(arr => arr.filter(i => i !== this.currentAyahIndex()-1));
      const prevIndex = this.currentAyahIndex() - 1;
      this.currentAyahIndex.set(prevIndex);
      this.currentWordIndex.set(0);
    }else{
      this.previousPage();
    }
  }

  revealNextWord(): void {
    const currentAyah = this.ayahs()[this.currentAyahIndex()];
    console.log('Current Ayah:', currentAyah);
    console.log('Current Word Index:', this.currentWordIndex());
    console.log('Current Words:', this.getCurrentWords());
    if (currentAyah ) {
      if (this.currentWordIndex() < this.getCurrentWords().length ) {
        this.currentWordIndex.update(i => i + 1);
      }
    }
  }

  revealPreviousWord(): void {
    if (this.currentWordIndex() > 0) {
      this.currentWordIndex.update(i => i - 1);
    } else if (this.currentAyahIndex() > 0) {
      this.currentAyahIndex.update(i => i - 1);
      const prevAyah = this.ayahs()[this.currentAyahIndex()];
      if (prevAyah && prevAyah.words) {
        this.currentWordIndex.set(prevAyah.words.length - 1);
      }
    }
  }

  getCurrentAyah(): any {
    return this.ayahs()[this.currentAyahIndex()];
  }

  getCurrentWords(): any[] {
    const ayah = this.getCurrentAyah();
    return ayah.text.split(' ');
  }

  isAyahRevealed(index: number): boolean {
    return this.revealedAyahs().includes(index);
  }
}
