import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { ChatWidgetComponent } from '../../features/live-chat/chat-widget';
import { ChatBubbleComponent } from '../../features/live-chat/chat-bubble'; // path đúng dự án


@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent , ChatWidgetComponent, ChatBubbleComponent],
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.css' , '../../app.css']
})
export class UserLayout {}
