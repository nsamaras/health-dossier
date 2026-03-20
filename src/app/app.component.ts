import { Component } from '@angular/core';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  loadedFeature = 'home';

  constructor() {

  }

  onNavigate(feature: string) {
    this.loadedFeature = feature;
  }
}