import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClothesService } from '../services/clothes.service';
import { CreateClothingDTO } from '../interfaces/clothes.interface';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-dashboard.component.html',
  styleUrl: './inventory-dashboard.component.css',
})
export class InventoryDashboard {
  apiResponse: any = null;
  isLoading: boolean = false;
  lastCreatedId: string = '';

  constructor(
    private clothesService: ClothesService,
    private cdr: ChangeDetectorRef
  ) { }

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
