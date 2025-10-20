import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header'; // ✅ Đổi import đúng tên export

describe('HeaderComponent', () => { // ✅ Đổi mô tả cho khớp tên component
  let component: HeaderComponent;          // ✅ Đổi kiểu
  let fixture: ComponentFixture<HeaderComponent>; // ✅ Đổi generic

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone component => đưa vào imports
      imports: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent); // ✅ Tạo theo đúng class
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
