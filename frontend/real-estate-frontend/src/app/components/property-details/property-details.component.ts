import { Component, OnInit } from '@angular/core';
     import { ActivatedRoute, Router } from '@angular/router';
     import { PropertyService } from '../../services/property.service';
     import { AuthService } from '../../services/auth.service';

     interface Property {
       _id: string;
       title: string;
       description: string;
       price: number;
       images?: string[];
       createdBy?: { _id: string; firstName: string };
     }

     @Component({
       selector: 'app-property-details',
       templateUrl: './property-details.component.html',
       styleUrls: ['./property-details.component.css']
     })
     export class PropertyDetailsComponent implements OnInit {
       property: Property | null = null;

       constructor(
         private route: ActivatedRoute,
         private router: Router,
         private propertyService: PropertyService,
         public authService: AuthService
       ) {}

       ngOnInit(): void {
         const id = this.route.snapshot.paramMap.get('id');
         if (id) {
           this.propertyService.getPropertyById(id).subscribe({
             next: (data) => {
               console.log('Property details:', data);
               this.property = data;
             },
             error: (error) => {
               console.error('Error fetching property:', error);
               this.router.navigate(['/']);
             }
           });
         }
       }

       editProperty(): void {
         if (this.property) {
           console.log('Navigating to edit:', this.property);
           this.router.navigate(['/', { state: { propertyToEdit: this.property } }]);
         }
       }

       deleteProperty(): void {
         if (this.property && confirm('Are you sure you want to delete this property?')) {
           this.propertyService.deleteProperty(this.property._id).subscribe({
             next: () => {
               this.router.navigate(['/']);
             },
             error: (error) => {
               console.error('Error deleting property:', error);
               alert('Failed to delete property');
             }
           });
         }
       }

       goBack(): void {
         this.router.navigate(['/']);
       }
     }