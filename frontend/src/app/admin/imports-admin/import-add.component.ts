import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ImportService } from '../../shared/services/import.service';
import { ImportModel } from '../../models/import.model';
import { Supplier } from '../../models/supplier.model';
import { SupplierAdminService } from '../../shared/services/supplier-admin.service';
import { Product, ProductResponse } from '../../models/product.model';
import { ProductAdminService } from '../../shared/services/product-admin.service';

@Component({
  selector: 'app-import-add',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './import-add.component.html'
})
export class ImportAddComponent implements OnInit {
  importData: ImportModel = {
    id: 0,
    importDate: '',
    totalCost: 0,
    status: 'pending',
    supplierId: 0,
    notes: '',
    details: []
  };

  suppliers: Supplier[] = [];
  products: Product[] = [];

  selectedProductId: number = 0;
  quantity: number = 1;
  unitPrice: number = 0;

  constructor(
    private importService: ImportService,
    private supplierService: SupplierAdminService,
    private productAdminService: ProductAdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // load danh sách NCC
    this.supplierService.list().subscribe({
      next: (res) => {
        this.suppliers = res.items;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Lỗi khi load nhà cung cấp:', err)
    });

    // load toàn bộ sản phẩm (không ràng buộc NCC nữa)
    this.productAdminService.getAllProducts(0, 100).subscribe({
      next: (res: ProductResponse) => {
        this.products = res.items;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Lỗi khi load sản phẩm:', err)
    });
  }

getProductName(productId?: number): string {
  if (!productId) return 'SP #?';
  const p = this.products.find(p => p.id === productId);
  return p ? p.name : `SP #${productId}`;
}


addDetail() {
  const product = this.products.find(p => p.id === this.selectedProductId);
  if (!product) return;

  this.importData.details.push({
    id: 0,
    importId: this.importData.id,
    productId: product.id,
    product: { id: product.id },   // ✅ đủ cho backend
    quantity: this.quantity,
    unitPrice: this.unitPrice > 0 ? this.unitPrice : product.price
  });

  this.selectedProductId = 0;
  this.quantity = 1;
  this.unitPrice = 0;
  this.updateTotal();
}


  removeDetail(index: number) {
    this.importData.details.splice(index, 1);
    this.updateTotal();
  }

  updateTotal() {
    this.importData.totalCost = this.getTotal();
  }

  getTotal(): number {
    return this.importData.details.reduce((sum, d) => sum + d.quantity * d.unitPrice, 0);
  }

saveImport() {
  const payload = {
    supplierId: this.importData.supplierId,
    notes: this.importData.notes,
    status: this.importData.status,   // ✅ thêm status gửi về
    details: this.importData.details.map(d => ({
      product: d.product,
      quantity: d.quantity,
      unitPrice: d.unitPrice
    }))
  };

  console.log("👉 Payload gửi đi:", payload);

  this.importService.create(payload).subscribe({
    next: (res) => {
      console.log("Phiếu nhập đã lưu:", res);
      alert("Lưu phiếu nhập thành công!");
      this.router.navigate(['/admin/imports']);
    },
    error: (err) => {
      console.error("Lỗi khi lưu phiếu nhập:", err);
      alert("Có lỗi xảy ra khi lưu phiếu nhập!");
    }
  });
}

}
