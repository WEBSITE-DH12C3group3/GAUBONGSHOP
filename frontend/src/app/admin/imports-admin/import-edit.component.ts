import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportService } from '../../shared/services/import.service';
import { ImportModel } from '../../models/import.model';
import { Supplier } from '../../models/supplier.model';
import { SupplierAdminService } from '../../shared/services/supplier-admin.service';
import { Product, ProductResponse } from '../../models/product.model';
import { ProductAdminService } from '../../shared/services/product-admin.service';

@Component({
  selector: 'app-import-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './import-edit.component.html'
})
export class ImportEditComponent implements OnInit {
  importData: ImportModel | null = null;

  suppliers: Supplier[] = [];
  products: Product[] = [];

  selectedProductId: number = 0;
  quantity: number = 1;
  unitPrice: number = 0;

  constructor(
    private route: ActivatedRoute,
    private importService: ImportService,
    private supplierService: SupplierAdminService,
    private productAdminService: ProductAdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));

  // load danh sách NCC
  this.supplierService.list().subscribe(res => {
    this.suppliers = res.items;
    this.cdr.detectChanges();
  });

  // load danh sách sản phẩm
  this.productAdminService.getAllProducts(0, 100).subscribe((res: ProductResponse) => {
    this.products = res.items;
    this.cdr.detectChanges();
  });

  // load phiếu nhập cần sửa
  this.importService.getById(id).subscribe({
    next: (data) => {
      // map lại details để đảm bảo có productId
      this.importData = {
        ...data,
        details: data.details.map(d => ({
          ...d,
          productId: d.productId ?? d.product?.id  // ✅ fallback nếu thiếu
        }))
      };
      this.cdr.detectChanges();
    },
    error: (err) => console.error('Lỗi load phiếu nhập:', err)
  });
}


  getProductName(productId?: number): string {
    if (!productId) return 'SP #?';
    const p = this.products.find(p => p.id === productId);
    return p ? p.name : `SP #${productId}`;
  }

  // thêm sản phẩm mới
  addDetail() {
    if (!this.importData) return;
    const product = this.products.find(p => p.id === this.selectedProductId);
    if (!product) return;

    this.importData.details.push({
      id: 0,
      importId: this.importData.id,
      productId: product.id,
      product: { id: product.id },
      quantity: this.quantity,
      unitPrice: this.unitPrice > 0 ? this.unitPrice : product.price
    });

    this.selectedProductId = 0;
    this.quantity = 1;
    this.unitPrice = 0;
    this.updateTotal();
  }

  // xóa sản phẩm
  removeDetail(index: number) {
    if (!this.importData) return;
    this.importData.details.splice(index, 1);
    this.updateTotal();
  }

  // cập nhật tổng tiền
  updateTotal() {
    if (!this.importData) return;
    this.importData.totalCost = this.getTotal();
  }

  getTotal(): number {
    if (!this.importData) return 0;
    return this.importData.details.reduce((sum, d) => sum + d.quantity * d.unitPrice, 0);
  }

  // lưu cập nhật
// lưu cập nhật
saveImport() {
  if (!this.importData) return;

const payload = {
  id: this.importData.id,
  importDate: this.importData.importDate,
  totalCost: this.getTotal(),
  notes: this.importData.notes ?? '',
  status: this.importData.status ?? 'pending',
  supplier: this.importData.supplierId 
              ? { id: this.importData.supplierId } 
              : null,   // ✅ nếu không chọn thì để null
  details: this.importData.details.map(d => ({
    id: d.id,
    importId: this.importData!.id,
    productId: d.productId ?? d.product?.id,
    product: { id: d.productId ?? d.product?.id },
    quantity: d.quantity,
    unitPrice: d.unitPrice
  }))
};


  console.log("👉 Payload gửi đi:", payload);

  this.importService.update(this.importData.id, payload).subscribe({
    next: (res) => {
      alert("Cập nhật phiếu nhập thành công!");
      this.router.navigate(['/admin/imports']);
    },
    error: (err) => {
      console.error("❌ Lỗi khi cập nhật phiếu nhập:", err);
      alert("Có lỗi xảy ra khi cập nhật phiếu nhập!");
    }
  });
}

}
