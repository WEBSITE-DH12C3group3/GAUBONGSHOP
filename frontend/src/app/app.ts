import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// Import header/footer
import { HeaderComponent } from './shared/header/header';
import { FooterComponent } from './shared/footer/footer';
import { ChatboxComponent } from './shared/chatbox/chatbox';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ChatboxComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {}
