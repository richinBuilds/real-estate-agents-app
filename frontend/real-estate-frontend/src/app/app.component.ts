import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  showBanner: boolean = true;

  constructor(public authService: AuthService, private router: Router) {

  // Listen to route changes
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: any) => {
    const currentUrl = event.urlAfterRedirects;
    this.showBanner = !(
      currentUrl.includes('/login') ||
      currentUrl.includes('/register') ||
      currentUrl.includes('/property/')
    );
  });
}
  

       logout(): void {
         this.authService.logout();
         this.router.navigate(['/login']);
       }
}
