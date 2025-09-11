-- Tạo database
CREATE DATABASE IF NOT EXISTS thu_bong_shop;
USE thu_bong_shop;

-- Bảng 1: Categories (Danh mục sản phẩm)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng 2: Brands (Thương hiệu)
CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    website_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng 3: Attributes (Thuộc tính)
CREATE TABLE attributes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng 4: Products (Sản phẩm)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    category_id INT,
    brand_id INT,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

-- Bảng 5: Product_Attributes (Thuộc tính sản phẩm)
CREATE TABLE product_attributes (
    product_id INT,
    attribute_id INT,
    value VARCHAR(100) NOT NULL,
    PRIMARY KEY (product_id, attribute_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
);

-- Bảng 6: Users (Người dùng)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng 7: Roles (Nhóm quyền)
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Bảng 8: Permissions (Quyền)
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Bảng 9: Role_Permissions (Gán quyền cho nhóm)
CREATE TABLE role_permissions (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Bảng 10: User_Roles (Gán nhóm cho user)
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Bảng 11: Carts (Giỏ hàng)
CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bảng 12: Orders (Đơn hàng)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng 13: Order_Items (Chi tiết đơn hàng)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Bảng 14: Payments (Thanh toán)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    payment_method ENUM('COD', 'bank_transfer', 'e_wallet', 'credit_card'),
    amount DECIMAL(10, 2),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('paid', 'pending', 'failed') DEFAULT 'pending',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Bảng 15: Shipping (Vận chuyển)
CREATE TABLE shipping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    address VARCHAR(255) NOT NULL,
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(50),
    shipped_date TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Bảng 16: Reviews (Đánh giá)
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    user_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng 17: Favorites (Yêu thích)
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bảng 18: Imports (Phiếu nhập)
CREATE TABLE imports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_cost DECIMAL(10, 2),
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng 19: Import_Details (Chi tiết phiếu nhập)
CREATE TABLE import_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    import_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (import_id) REFERENCES imports(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Trigger để tự động cập nhật stock khi nhập hàng
DELIMITER //
CREATE TRIGGER after_import_details_insert
AFTER INSERT ON import_details
FOR EACH ROW
BEGIN
    UPDATE products 
    SET stock = stock + NEW.quantity
    WHERE id = NEW.product_id;
END //
DELIMITER ;

-- Thêm chỉ mục để tối ưu tìm kiếm
CREATE INDEX idx_product_name ON products(name);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_import_details_product ON import_details(product_id);

-- Dữ liệu mẫu

-- Categories
INSERT INTO categories (name, description) VALUES 
('Gấu Teddy', 'Danh mục gấu bông Teddy cao cấp'),
('Thỏ Bông', 'Danh mục thỏ nhồi bông'),
('Hoa Bông', 'Danh mục bó hoa bằng bông');

-- Brands
INSERT INTO brands (name, description) VALUES 
('Teddy', 'Thương hiệu gấu bông cao cấp'),
('Kuromi', 'Thương hiệu thú bông nhân vật hoạt hình'),
('OEM', 'Thương hiệu sản xuất chung');

-- Attributes
INSERT INTO attributes (name, description) VALUES 
('Màu sắc', 'Màu sắc của sản phẩm'),
('Kích thước', 'Kích thước của sản phẩm'),
('Chất liệu', 'Chất liệu làm sản phẩm');

-- Products
INSERT INTO products (name, description, price, image_url, category_id, brand_id, stock) VALUES 
('Gấu Teddy Socola', 'Gấu bông màu nâu socola', 445000.00, 'https://example.com/teddy.jpg', 1, 1, 100),
('Thỏ Bông Trắng', 'Thỏ bông trắng mềm mại', 250000.00, 'https://example.com/rabbit.jpg', 2, 2, 50),
('Hoa Bông Tím', 'Bó hoa nhồi bông màu tím', 350000.00, 'https://example.com/flower.jpg', 3, 3, 20);

-- Product_Attributes
INSERT INTO product_attributes (product_id, attribute_id, value) VALUES 
(1, 1, 'Nâu'), (1, 2, '30cm'), (1, 3, 'Bông gòn cao cấp'),
(2, 1, 'Trắng'), (2, 2, '25cm'), (2, 3, 'Vải lông mềm'),
(3, 1, 'Tím'), (3, 2, '20cm'), (3, 3, 'Bông tổng hợp');

-- Users
INSERT INTO users (username, password, email, address, phone) VALUES 
('khachhang1', 'hashed_pass1', 'khachhang1@example.com', '123 Đường Láng, Hà Nội', '0901234567'),
('seller1', 'hashed_pass2', 'seller1@example.com', '456 Nguyễn Huệ, TP.HCM', '0912345678'),
('admin1', 'hashed_pass3', 'admin1@example.com', '789 Lê Lợi, Đà Nẵng', '0923456789');

-- Roles
INSERT INTO roles (name, description) VALUES 
('Customer', 'Khách hàng thông thường'),
('Seller', 'Nhà bán hàng quản lý sản phẩm'),
('Admin', 'Quản trị viên toàn quyền');

-- Permissions
INSERT INTO permissions (name, description) VALUES 
('view_products', 'Xem danh sách sản phẩm'),
('add_to_cart', 'Thêm vào giỏ hàng'),
('add_to_favorites', 'Thêm vào yêu thích'),
('place_order', 'Đặt hàng'),
('view_orders', 'Xem đơn hàng của mình'),
('manage_products', 'Quản lý sản phẩm (thêm/sửa/xóa)'),
('manage_orders', 'Quản lý đơn hàng (xử lý, hủy)'),
('manage_users', 'Quản lý người dùng'),
('view_reports', 'Xem báo cáo doanh thu'),
('manage_imports', 'Quản lý phiếu nhập (tạo, sửa, xóa)'),
('view_imports', 'Xem danh sách phiếu nhập');

-- Role_Permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES 
-- Customer
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
-- Seller
(2, 1), (2, 6), (2, 7), (2, 10), (2, 11),
-- Admin
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10), (3, 11);

-- User_Roles
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1),  -- khachhang1 là Customer
(2, 2),  -- seller1 là Seller
(3, 3);  -- admin1 là Admin

-- Carts
INSERT INTO carts (user_id, product_id, quantity) VALUES 
(1, 1, 2),  -- khachhang1 thêm 2 Gấu Teddy Socola vào giỏ
(1, 2, 1);  -- khachhang1 thêm 1 Thỏ Bông Trắng

-- Orders
INSERT INTO orders (user_id, total_amount, status) VALUES 
(1, 890000.00, 'pending'),  -- Đơn hàng của khachhang1
(1, 250000.00, 'shipped');  -- Đơn hàng khác

-- Order_Items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 2, 445000.00),  -- 2 Gấu Teddy Socola
(2, 2, 1, 250000.00);  -- 1 Thỏ Bông Trắng

-- Payments
INSERT INTO payments (order_id, payment_method, amount, status) VALUES 
(1, 'COD', 890000.00, 'pending'),
(2, 'e_wallet', 250000.00, 'paid');

-- Shipping
INSERT INTO shipping (order_id, address, shipping_method, tracking_number) VALUES 
(1, '123 Đường Láng, Hà Nội', 'GHTK', 'GH12345'),
(2, '123 Đường Láng, Hà Nội', 'Viettel Post', 'VT67890');

-- Reviews
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES 
(1, 1, 5, 'Gấu bông rất mềm và đáng yêu!'),
(2, 1, 4, 'Thỏ bông đẹp nhưng hơi nhỏ');

-- Favorites
INSERT INTO favorites (user_id, product_id) VALUES 
(1, 1),  -- khachhang1 yêu thích Gấu Teddy Socola
(1, 3);  -- khachhang1 yêu thích Hoa Bông Tím

-- Imports
INSERT INTO imports (supplier_name, total_cost, status, notes) VALUES 
('Công ty ABC', 5000000.00, 'completed', 'Nhập lô gấu Teddy mới'),
('Nhà cung cấp XYZ', 3000000.00, 'pending', 'Chờ kiểm tra chất lượng');

-- Import_Details
INSERT INTO import_details (import_id, product_id, quantity, unit_price) VALUES 
(1, 1, 50, 80000.00),  -- Nhập 50 Gấu Teddy Socola, giá nhập 80k/con
(2, 2, 30, 60000.00);  -- Nhập 30 Thỏ Bông Trắng, giá nhập 60k/con
