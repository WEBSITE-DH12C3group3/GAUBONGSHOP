import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { ChatWidgetComponent } from '../chat-widget/chat-widget';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ChatWidgetComponent],
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.css']
})
export class UserLayout {}
