import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ChatboxComponent } from '../../shared/chatbox/chatbox';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';


@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ChatboxComponent, HeaderComponent, FooterComponent ],
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.css' , '../../app.css']
})
export class UserLayout {}
