import { Component, EventEmitter, Input, Output } from '@angular/core';
     import { PropertyService } from '../../services/property.service';
     import { Router } from '@angular/router';
     import { AuthService } from '../../services/auth.service';

     export interface Property {
       _id: string;
       title: string;
       description: string;
       price: number;
       images?: string[];
       featured?: boolean;
       createdBy?: { _id: string; firstName: string };
     }

     @Component({
       selector: 'app-property-upload',
       templateUrl: './property-upload.component.html',
       styleUrls: ['./property-upload.component.css']
     })
     export class PropertyUploadComponent {
       @Input() propertyToEdit: Property | null = null;
       @Output() close = new EventEmitter<void>();
       property = { title: '', description: '', price: 0, images: [] as File[], existingImages: [] as string[], featured: false};

       constructor(public authService: AuthService,private propertyService: PropertyService, private router: Router) {}

       ngOnChanges(): void {
         if (this.propertyToEdit) {
           this.property = {
             title: this.propertyToEdit.title || '',
             description: this.propertyToEdit.description || '',
             price: this.propertyToEdit.price || 0,
             images: [],
             existingImages: this.propertyToEdit.images || [],
             featured: this.propertyToEdit.featured || false 
           };
         }
       }

       onFileChange(event: Event): void {
         const input = event.target as HTMLInputElement;
         if (input.files && input.files.length > 0) {
           const maxFiles = 5 - (this.property.existingImages?.length || 0);
           const newFiles = Array.from(input.files).slice(0, maxFiles);
           this.property.images = [...this.property.images, ...newFiles];
         }
       }

       addProperty(): void {
         const formData = new FormData();
         formData.append('title', this.property.title);
         formData.append('description', this.property.description);
         formData.append('price', this.property.price.toString());
         formData.append('featured', this.property.featured.toString());
         this.property.images.forEach((file) => {
           formData.append('images', file);
         });
         formData.append('existingImages', JSON.stringify(this.property.existingImages || []));

         const request = this.propertyToEdit
           ? this.propertyService.updateProperty(this.propertyToEdit._id, formData)
           : this.propertyService.addProperty(formData);

         request.subscribe({
           next: (response) => {
             console.log(`${this.propertyToEdit ? 'Updated' : 'Added'} property:`, response);
             this.close.emit();
             this.resetForm();
             this.router.navigate(['/']);
           },
           error: (error) => {
             console.error(`Failed to ${this.propertyToEdit ? 'update' : 'add'} property:`, error);
             alert(`Failed to ${this.propertyToEdit ? 'update' : 'add'} property: ${error.message}`);
           }
         });
       }

       goBack(): void {
         this.router.navigate(['/']);
         this.close.emit();
         this.resetForm();
       }

       resetForm(): void {
         this.property = { title: '', description: '', price: 0, images: [], existingImages: [], featured: false };
         this.propertyToEdit = null;
       }
     }