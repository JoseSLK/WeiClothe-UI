import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClothesService } from '../services/clothes.service';
import { CreateClothingDTO, ClothingItem } from '../interfaces/clothes.interface';

const CAROUSEL_STORAGE_KEY = 'wei-inventory-carousel-enabled';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-dashboard.component.html',
  styleUrl: './inventory-dashboard.component.css',
})
export class InventoryDashboard implements OnInit {
  apiResponse: any = null;
  isLoading: boolean = false;
  lastCreatedId: string = '';
  clothesList: ClothingItem[] = [];

  /** User preference: show animated L-carousel when clothes exist */
  carouselEnabled = true;

  /** Flat list: two identical halves concatenated for seamless CSS loop */
  carouselTrackItems: ClothingItem[] = [];

  /** Slots in one half of the track (for CSS --item-count) */
  carouselSlotsPerHalf = 0;

  /** Seconds — horizontal strip (right → left) */
  carouselHorizontalDurationSec = 30;

  /** Seconds — vertical strip (top → down) */
  carouselVerticalDurationSec = 30;

  constructor(
    private clothesService: ClothesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const stored = localStorage.getItem(CAROUSEL_STORAGE_KEY);
    if (stored !== null) {
      this.carouselEnabled = stored === 'true';
    }
    this.loadClothes();
  }

  get hasCarouselClothes(): boolean {
    return (this.clothesList?.length ?? 0) > 0;
  }

  get showCarousel(): boolean {
    return this.carouselEnabled && this.hasCarouselClothes;
  }

  toggleCarousel(): void {
    this.carouselEnabled = !this.carouselEnabled;
    localStorage.setItem(CAROUSEL_STORAGE_KEY, String(this.carouselEnabled));
    this.cdr.detectChanges();
  }

  trackByCarouselIndexHorizontal(index: number): string {
    return `h-${index}`;
  }

  trackByCarouselIndexVertical(index: number): string {
    return `v-${index}`;
  }

  /**
   * Repetitions of the full clothes list per half-track.
   * Few unique items → more repeats so loop never looks empty.
   */
  private repetitionsPerHalf(n: number): number {
    if (n <= 0) return 0;
    if (n <= 2) return 8;
    if (n <= 10) return 4;
    return 2;
  }

  private rebuildCarouselTrack(): void {
    const list = this.clothesList;
    if (!list.length) {
      this.carouselTrackItems = [];
      this.carouselSlotsPerHalf = 0;
      return;
    }

    const reps = this.repetitionsPerHalf(list.length);
    const half: ClothingItem[] = [];
    for (let r = 0; r < reps; r++) {
      half.push(...list);
    }
    this.carouselSlotsPerHalf = half.length;
    this.carouselTrackItems = [...half, ...half];

    const slots = this.carouselSlotsPerHalf;
    // Fewer effective items → slower animation so it does not blur past
    if (slots <= 6) {
      this.carouselHorizontalDurationSec = 48;
      this.carouselVerticalDurationSec = 52;
    } else if (slots <= 20) {
      this.carouselHorizontalDurationSec = 32;
      this.carouselVerticalDurationSec = 36;
    } else {
      this.carouselHorizontalDurationSec = 22;
      this.carouselVerticalDurationSec = 26;
    }
  }

  loadClothes() {
    const userId = this.clothesService.getUserIdFromToken();
    if (userId) {
      this.clothesService.getUserClothes(userId).subscribe({
        next: (clothes) => {
          this.clothesList = clothes;
          this.rebuildCarouselTrack();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading clothes', err)
      });
    }
  }

  updateId(event: any) {
    this.lastCreatedId = event.target.value;
    this.cdr.detectChanges();
  }

  testPing() {
    this.executeRequest(this.clothesService.ping());
  }

  testCreateClothing() {
    // Generate a unique URL each time to bypass PostgreSQL "UNIQUE" constraint
    const uniqueUrl = `https://example.com/test-shirt-${Date.now()}.jpg`;

    const dto: CreateClothingDTO = {
      image_url: uniqueUrl,
      garment_type: 'T-Shirt',
      name: 'Camiseta de Prueba',
      source: 'manual',
      status: 'queued'
    };

    this.isLoading = true;
    this.cdr.detectChanges();

    this.clothesService.createClothing(dto).subscribe({
      next: (res: any) => {
        this.apiResponse = res;
        this.isLoading = false;

        if (res && res.id) {
          this.lastCreatedId = res.id;
        } else if (res && res.clothing && res.clothing.id) {
          this.lastCreatedId = res.clothing.id;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al crear:', err);
        this.apiResponse = {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error_body: err.error
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  testGetMyClothes() {
    const userId = this.clothesService.getUserIdFromToken();
    if (!userId) {
      this.apiResponse = { error: 'Error: No se pudo extraer el ID de usuario del JWT.' };
      this.cdr.detectChanges();
      return;
    }
    this.executeRequest(this.clothesService.getUserClothes(userId));
  }

  testGetClothingDetail() {
    if (!this.lastCreatedId) {
      this.apiResponse = { error: 'Primero debes "Crear Prenda" para obtener un ID válido para consultar.' };
      this.cdr.detectChanges();
      return;
    }
    this.executeRequest(this.clothesService.getClothingById(this.lastCreatedId));
  }

  testUpdateStatus() {
    if (!this.lastCreatedId) {
      this.apiResponse = { error: 'Primero debes "Crear Prenda" para obtener un ID válido.' };
      this.cdr.detectChanges();
      return;
    }
    this.executeRequest(this.clothesService.updateStatus(this.lastCreatedId, { status: 'processing' }));
  }

  testUpdateClassification() {
    if (!this.lastCreatedId) {
      this.apiResponse = { error: 'Primero debes "Crear Prenda" para obtener un ID válido.' };
      this.cdr.detectChanges();
      return;
    }
    // Simulate AI data
    const aiData = {
      name: 'Prueba',
      category: 'Tops',
      subcategory: 'T-Shirt',
      color: 'Blue',
      pattern: 'Solid',
      material: 'Cotton',
      season: 'Summer',
      occasion: 'Casual',
      confidence: 0.98,
      model_name: 'YOLOv8-Clothes',
      model_version: 'v1.2.0',
      status: 'completed',
      processed_at: new Date().toISOString()
    };
    this.executeRequest(this.clothesService.updateClassification(this.lastCreatedId, aiData));
  }

  private executeRequest(observable: any) {
    this.isLoading = true;
    this.apiResponse = null;
    this.cdr.detectChanges();

    console.log('Enviando petición a Go...');

    observable.subscribe({
      next: (res: any) => {
        console.log('Respuesta exitosa:', res);
        this.apiResponse = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error en la petición:', err);
        this.apiResponse = {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error_body: err.error
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
