import { Component, OnInit } from '@angular/core';
     import { PropertyService } from '../../services/property.service';
     import { AuthService } from '../../services/auth.service';
     import { Router, NavigationExtras } from '@angular/router';
     import { Property } from '../property-upload/property-upload.component';

  /*   interface Property {
       _id: string;
       title: string;
       description: string;
       price: number;
       images?: string[];
       createdBy?: { _id: string; firstname: string };
     }   */

     @Component({
       selector: 'app-home',
       templateUrl: './home.component.html',
       styleUrls: ['./home.component.css']
     })
     export class HomeComponent implements OnInit {
       properties: Property[] = [];
       featuredProperties: Property[] = []; 
       showUploadForm = false;
       propertyToEdit: Property | null = null;

       constructor(
         private propertyService: PropertyService,
         public authService: AuthService,
         private router: Router
       ) {}

       ngOnInit(): void {
         this.loadProperties();
         if (this.authService.isLoggedIn()) {
          this.loadFeaturedProperties(); // Load featured properties for logged-in users
        }
         const navigation = this.router.getCurrentNavigation();
         if (navigation?.extras.state?.['propertyToEdit']) {
           this.propertyToEdit = navigation.extras.state['propertyToEdit'];
           this.showUploadForm = true;
         }
       }

       loadProperties(): void {
         this.propertyService.getProperties().subscribe({
           next: (data) => {
             console.log('Properties fetched:', data);
             this.properties = data;
           },
           error: (error) => {
             console.error('Error fetching properties:', error);
           }
         });
       }

       loadFeaturedProperties(): void {
        this.propertyService.getFeaturedProperties().subscribe({
          next: (data) => {
            console.log('Featured properties fetched:', data);
            this.featuredProperties = data;
          },
          error: (error) => {
            console.error('Error fetching featured properties:', error);
          }
        });
      }

       editProperty(property: Property): void {
         console.log('Editing property:', property);
         this.propertyToEdit = property;
         this.showUploadForm = true;
       }

       deleteProperty(id: string): void {
         if (confirm('Are you sure you want to delete this property?')) {
           this.propertyService.deleteProperty(id).subscribe({
             next: () => {
               this.properties = this.properties.filter(p => p._id !== id);
               this.loadProperties();
             },
             error: (error) => {
               console.error('Error deleting property:', error);
               alert('Failed to delete property');
             }
           });
         }
       }
     }