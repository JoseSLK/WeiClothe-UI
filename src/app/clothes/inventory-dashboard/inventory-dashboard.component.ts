import {
  Component,
  ChangeDetectorRef,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClothesService } from '../services/clothes.service';
import { RecommendationService } from '../services/recommendation.service';
import { StylePreferencesService } from '../services/style-preferences.service';
import { CreateClothingDTO, ClothingItem, OutfitRecommendation, UserStylePreferences, RecommendationParams } from '../interfaces/clothes.interface';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-dashboard.component.html',
  styleUrl: './inventory-dashboard.component.css',
})
export class InventoryDashboard implements OnInit, AfterViewInit {
  @ViewChild('scrollArea', { static: false }) scrollArea?: ElementRef<HTMLElement>;

  apiResponse: any = null;
  isLoading: boolean = false;
  lastCreatedId: string = '';
  clothesList: ClothingItem[] = [];

  /** Section id matching `section-${id}` in template; synced on scroll / tab click */
  activeSection = 'inicio';

  navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'armario', label: 'Armario' },
    { id: 'recomendaciones', label: 'Recomendaciones' },
    { id: 'datos', label: 'Mis datos' },
  ];

  userGreeting = 'Usuario';
  userInitials = 'U';

  /** Armario — search (name / color) */
  armarioSearchQuery = '';

  /** Armario — inline add form */
  armarioAddFormOpen = false;
  armarioUploading = false;
  armarioGarmentType = '';
  armarioGarmentName = '';
  armarioSelectedImage: File | null = null;
  armarioImageError = '';
  armarioUploadError = '';
  armarioFileInputKey = 0;
  armarioReloading = false;

  /** Recomendaciones */
  recoList: OutfitRecommendation[] = [];
  recoLoading = false;
  recoError = '';
  recoSeason = '';
  recoOccasion = '';
  recoExpandedId: string | null = null;

  /** Preferencias de estilo */
  prefsLoading = false;
  prefsSaving = false;
  prefsError = '';
  prefsSaved = false;
  prefsNotFound = false;
  prefsLoaded = false;
  selectedColors: string[] = [];
  avoidColors: string[] = [];
  selectedSeasons: string[] = [];
  selectedOccasions: string[] = [];
  readonly COLOR_OPTIONS = ['red','blue','black','white','green','yellow','pink','orange','purple','brown','gray','beige','navy','multicolor'];
  readonly SEASON_OPTIONS = ['summer','winter','spring','fall','all_season'];
  readonly OCCASION_OPTIONS = ['casual','formal','sport','party','outdoor','beach'];

  /** Modal detalle prenda */
  detailItem: ClothingItem | null = null;
  detailLoading = false;
  detailOpen = false;

  /** Aligns with scroll-margin-top (~header + padding) */
  private headerOffsetPx = 68;
  private scrollSpyRaf = 0;

  constructor(
    private clothesService: ClothesService,
    private recommendationService: RecommendationService,
    private stylePreferencesService: StylePreferencesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.readUserFromToken();
    this.loadClothes();
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.updateActiveSectionFromScroll());
  }

  get filteredArmarioClothes(): ClothingItem[] {
    const q = this.armarioSearchQuery.trim().toLowerCase();
    if (!q) return this.clothesList;
    return this.clothesList.filter((item) => {
      const name = (item.name ?? '').toLowerCase();
      const color = (item.color ?? '').toLowerCase();
      return name.includes(q) || color.includes(q);
    });
  }

  get canSubmitArmarioGarment(): boolean {
    return (
      !!this.armarioSelectedImage &&
      this.armarioGarmentType.trim().length > 0 &&
      this.armarioGarmentName.trim().length > 0
    );
  }

  get showArmarioGarmentTypeField(): boolean {
    return !!this.armarioSelectedImage;
  }

  get showArmarioNameField(): boolean {
    return this.armarioGarmentType.trim().length > 0;
  }

  get showArmarioSubmit(): boolean {
    return this.canSubmitArmarioGarment;
  }

  trackByClothingId(_index: number, item: ClothingItem): string {
    return item.id;
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.activeSection = id;
    if (id === 'datos' && !this.prefsLoaded) {
      this.loadPreferences();
    }
    this.cdr.detectChanges();
  }

  onDashboardScroll(): void {
    if (this.scrollSpyRaf) cancelAnimationFrame(this.scrollSpyRaf);
    this.scrollSpyRaf = requestAnimationFrame(() => {
      this.scrollSpyRaf = 0;
      this.updateActiveSectionFromScroll();
    });
  }

  toggleArmarioAddForm(): void {
    this.armarioAddFormOpen = !this.armarioAddFormOpen;
    this.cdr.detectChanges();
  }

  onArmarioImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.armarioImageError = '';
    this.armarioUploadError = '';
    if (!file) {
      this.armarioSelectedImage = null;
      this.cdr.detectChanges();
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.armarioImageError = 'Archivo no es imagen.';
      this.armarioSelectedImage = null;
      input.value = '';
      this.cdr.detectChanges();
      return;
    }
    this.armarioSelectedImage = file;
    this.cdr.detectChanges();
  }

  submitArmarioGarment(): void {
    if (!this.canSubmitArmarioGarment || this.armarioUploading) return;

    const formData = new FormData();
    formData.append('image', this.armarioSelectedImage!);
    formData.append('garment_type', this.armarioGarmentType.trim());
    formData.append('name', this.armarioGarmentName.trim());

    this.armarioUploading = true;
    this.armarioUploadError = '';
    this.cdr.detectChanges();

    this.clothesService.uploadClothing(formData).subscribe({
      next: () => {
        this.armarioUploading = false;
        this.clothesService.invalidateClothesCache();
        this.armarioGarmentType = '';
        this.armarioGarmentName = '';
        this.armarioSelectedImage = null;
        this.armarioFileInputKey++;
        this.armarioImageError = '';
        this.loadClothes();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Armario upload error', err);
        this.armarioUploading = false;
        this.armarioUploadError =
          err?.error?.message ?? err?.message ?? 'Error al subir la prenda.';
        this.cdr.detectChanges();
      },
    });
  }

  loadClothes(): void {
    const userId = this.clothesService.getUserIdFromToken();
    if (userId) {
      this.clothesService.getCachedClothes(userId).subscribe({
        next: (clothes) => {
          this.clothesList = clothes;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading clothes', err),
      });
    }
  }

  reloadClothes(): void {
    if (this.armarioReloading) return;
    this.armarioReloading = true;
    this.cdr.detectChanges();

    this.clothesService.invalidateClothesCache();
    const userId = this.clothesService.getUserIdFromToken();
    if (!userId) {
      this.armarioReloading = false;
      this.cdr.detectChanges();
      return;
    }
    this.clothesService.getCachedClothes(userId).subscribe({
      next: (clothes) => {
        this.clothesList = clothes;
        this.armarioReloading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error reloading clothes', err);
        this.armarioReloading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ─── Recomendaciones ─────────────────────────────────────────

  loadRecommendations(): void {
    const userId = this.clothesService.getUserIdFromToken();
    if (!userId) return;

    this.recoLoading = true;
    this.recoError = '';
    this.cdr.detectChanges();

    const params: RecommendationParams = { user_id: userId };
    if (this.recoSeason) params.season = this.recoSeason;
    if (this.recoOccasion) params.occasion = this.recoOccasion;

    this.recommendationService.getRecommendations(params).subscribe({
      next: (recs) => {
        this.recoList = recs;
        this.recoLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading recommendations', err);
        this.recoError = err?.error?.error || 'Error al cargar recomendaciones.';
        this.recoLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleRecoDetail(id: string): void {
    this.recoExpandedId = this.recoExpandedId === id ? null : id;
    this.cdr.detectChanges();
  }

  // ─── Preferencias de estilo ──────────────────────────────────

  loadPreferences(): void {
    const userId = this.clothesService.getUserIdFromToken();
    if (!userId || this.prefsLoaded) return;

    this.prefsLoading = true;
    this.prefsError = '';
    this.cdr.detectChanges();

    this.stylePreferencesService.get(userId).subscribe({
      next: (prefs) => {
        this.selectedColors = prefs.preferred_colors || [];
        this.avoidColors = prefs.avoid_colors || [];
        this.selectedSeasons = prefs.preferred_seasons || [];
        this.selectedOccasions = prefs.preferred_occasions || [];
        this.prefsNotFound = false;
        this.prefsLoading = false;
        this.prefsLoaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 404) {
          this.prefsNotFound = true;
        } else {
          this.prefsError = err?.error?.error || 'Error al cargar preferencias.';
        }
        this.prefsLoading = false;
        this.prefsLoaded = true;
        this.cdr.detectChanges();
      },
    });
  }

  savePreferences(): void {
    const userId = this.clothesService.getUserIdFromToken();
    if (!userId || this.prefsSaving) return;

    this.prefsSaving = true;
    this.prefsSaved = false;
    this.prefsError = '';
    this.cdr.detectChanges();

    const payload: Partial<UserStylePreferences> = {
      preferred_colors: this.selectedColors,
      avoid_colors: this.avoidColors,
      preferred_seasons: this.selectedSeasons,
      preferred_occasions: this.selectedOccasions,
    };

    this.stylePreferencesService.save(userId, payload).subscribe({
      next: () => {
        this.prefsSaving = false;
        this.prefsSaved = true;
        this.prefsNotFound = false;
        this.prefsLoaded = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.prefsSaved = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Error saving preferences', err);
        this.prefsSaving = false;
        this.prefsError = err?.error?.error || 'Error al guardar preferencias.';
        this.cdr.detectChanges();
      },
    });
  }

  toggleChip(list: string[], value: string): void {
    const idx = list.indexOf(value);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(value);
    }
    this.prefsSaved = false;
    this.cdr.detectChanges();
  }

  // ─── Modal detalle prenda ────────────────────────────────────

  openGarmentDetail(id: string): void {
    this.detailOpen = true;
    this.detailLoading = true;
    this.detailItem = null;
    this.cdr.detectChanges();

    this.clothesService.getClothingById(id).subscribe({
      next: (item) => {
        this.detailItem = item;
        this.detailLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading garment detail', err);
        this.detailLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  closeGarmentDetail(): void {
    this.detailOpen = false;
    this.detailItem = null;
    this.cdr.detectChanges();
  }

  onModalOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('garment-modal-overlay')) {
      this.closeGarmentDetail();
    }
  }

  updateId(event: any): void {
    this.lastCreatedId = event.target.value;
    this.cdr.detectChanges();
  }

  testPing(): void {
    this.executeRequest(this.clothesService.ping());
  }

  testCreateClothing(): void {
    const uniqueUrl = `https://example.com/test-shirt-${Date.now()}.jpg`;

    const dto: CreateClothingDTO = {
      image_url: uniqueUrl,
      garment_type: 'T-Shirt',
      name: 'Camiseta de Prueba',
      source: 'manual',
      status: 'queued',
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
          error_body: err.error,
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  testGetMyClothes(): void {
    const userId = this.clothesService.getUserIdFromToken();
    if (!userId) {
      this.apiResponse = {
        error: 'Error: No se pudo extraer el ID de usuario del JWT.',
      };
      this.cdr.detectChanges();
      return;
    }
    this.executeRequest(this.clothesService.getUserClothes(userId));
  }

  testGetClothingDetail(): void {
    if (!this.lastCreatedId) {
      this.apiResponse = {
        error:
          'Primero debes "Crear Prenda" para obtener un ID válido para consultar.',
      };
      this.cdr.detectChanges();
      return;
    }
    this.executeRequest(this.clothesService.getClothingById(this.lastCreatedId));
  }

  testUpdateStatus(): void {
    if (!this.lastCreatedId) {
      this.apiResponse = {
        error: 'Primero debes "Crear Prenda" para obtener un ID válido.',
      };
      this.cdr.detectChanges();
      return;
    }
    this.executeRequest(
      this.clothesService.updateStatus(this.lastCreatedId, { status: 'processing' })
    );
  }

  testUpdateClassification(): void {
    if (!this.lastCreatedId) {
      this.apiResponse = {
        error: 'Primero debes "Crear Prenda" para obtener un ID válido.',
      };
      this.cdr.detectChanges();
      return;
    }
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
      processed_at: new Date().toISOString(),
    };
    this.executeRequest(
      this.clothesService.updateClassification(this.lastCreatedId, aiData)
    );
  }

  private readUserFromToken(): void {
    const storage =
      typeof globalThis !== 'undefined' &&
      'localStorage' in globalThis &&
      globalThis.localStorage
        ? globalThis.localStorage
        : null;
    if (!storage) {
      this.setGreetingAndInitials('Usuario');
      return;
    }
    const token = storage.getItem('token');
    if (!token) {
      this.setGreetingAndInitials('Usuario');
      return;
    }
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const p = JSON.parse(decodedJson) as Record<string, unknown>;
      const nick =
        (typeof p['nickname'] === 'string' && p['nickname']) ||
        (typeof p['name'] === 'string' && p['name']) ||
        (typeof p['given_name'] === 'string' && p['given_name']) ||
        '';
      const email = typeof p['email'] === 'string' ? p['email'] : '';
      const local = email.includes('@') ? email.split('@')[0] : '';
      const name = (nick || local || 'Usuario').trim();
      this.setGreetingAndInitials(name || 'Usuario');
    } catch {
      this.setGreetingAndInitials('Usuario');
    }
  }

  private setGreetingAndInitials(display: string): void {
    this.userGreeting = display;
    const parts = display.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      this.userInitials = (
        parts[0][0] + parts[parts.length - 1][0]
      ).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
      this.userInitials = parts[0].slice(0, 2).toUpperCase();
    } else if (parts.length === 1) {
      this.userInitials = parts[0][0]?.toUpperCase() ?? 'U';
    } else {
      this.userInitials = 'U';
    }
  }

  private updateActiveSectionFromScroll(): void {
    const root = this.scrollArea?.nativeElement;
    if (!root) return;

    const rootRect = root.getBoundingClientRect();
    const threshold = rootRect.top + this.headerOffsetPx;
    let current = this.navItems[0].id;
    for (const item of this.navItems) {
      const el = document.getElementById(`section-${item.id}`);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= threshold) {
        current = item.id;
      }
    }
    if (current !== this.activeSection) {
      this.activeSection = current;
      if (current === 'datos' && !this.prefsLoaded) {
        this.loadPreferences();
      }
      this.cdr.detectChanges();
    }
  }

  private executeRequest(observable: any): void {
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
          error_body: err.error,
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
