-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 18, 2025 at 04:27 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30
CREATE DATABASE IF NOT EXISTS thu_bong_shop;
USE thu_bong_shop;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `thu_bong_shop`
--

-- --------------------------------------------------------

--
-- Table structure for table `attributes`
--

CREATE TABLE `attributes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attributes`
--

INSERT INTO `attributes` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Màu sắc', 'Màu sắc của sản phẩm', '2025-08-25 14:50:57'),
(2, 'Kích thước', 'Kích thước của sản phẩm', '2025-08-25 14:50:57'),
(3, 'Chất liệu', 'Chất liệu làm sản phẩm', '2025-08-25 14:50:57'),
(4, 'Hình dạng', 'Hình dạng tổng thể của sản phẩm', '2025-09-14 10:00:00'),
(5, 'Phong cách', 'Phong cách thiết kế của sản phẩm', '2025-09-14 10:00:00'),
(6, 'Đối tượng sử dụng', 'Đối tượng phù hợp với sản phẩm', '2025-09-14 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `website_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `description`, `logo_url`, `website_url`, `created_at`) VALUES
(1, 'Teddy', 'Thương hiệu gấu bông cao cấp', '/Brandimg/1756284670991-82964158-OIP.webp', 'https://www.teddy.it/en/home/', '2025-08-25 14:50:57'),
(2, 'Kuromi', 'Thương hiệu thú bông nhân vật hoạt hình', '/Brandimg/1756284599669-261707982-download (1).webp', 'https://kuromi.co.uk/what-animal-is-kuromi/', '2025-08-25 14:50:57'),
(3, 'OEM', 'Thương hiệu sản xuất chung', '/Brandimg/1756284502761-606171162-download.webp', 'https://thunhoibongthanhdat.com/', '2025-08-25 14:50:57'),
(4, 'Steiff', 'Hãng gấu bông cao cấp đến từ Đức', '/Brandimg/1756284427104-458305385-OIF.webp', 'https://www.steiff.com/en', '2025-08-27 08:47:07');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_featured` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`, `is_featured`) VALUES
(1, 'Gấu Teddy meme', 'Danh mục gấu bông Teddy cao cấp', '2025-08-25 14:50:57', 1),
(2, 'Thỏ Bông', 'Danh mục thỏ nhồi bông', '2025-08-25 14:50:57', 1),
(4, 'kabuchino', 'hoạt hình vui vẻ', '2025-08-27 08:25:23', 1),
(5, 'KHÁ BẢNH', 'dân chơi nửa mùa', '2025-08-28 06:08:34', 1);

-- --------------------------------------------------------

--
-- Table structure for table `chat_sessions`
--

CREATE TABLE `chat_sessions` (
  `id` int(11) NOT NULL,
  `participant1_id` int(11) NOT NULL,
  `participant2_id` int(11) NOT NULL,
  `status` enum('open','closed','pending') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_sessions`
--

INSERT INTO `chat_sessions` (`id`, `participant1_id`, `participant2_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 'open', '2025-09-16 06:50:18', '2025-09-16 06:50:18'),
(2, 1, 36, 'open', '2025-09-16 16:10:19', '2025-09-16 16:10:19');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percent','fixed') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `min_order_amount` decimal(10,2) DEFAULT NULL,
  `exclude_discounted_items` tinyint(1) NOT NULL DEFAULT 0,
  `applicable_payment_methods` varchar(255) DEFAULT NULL,
  `applicable_roles` varchar(255) DEFAULT NULL,
  `region_include` varchar(255) DEFAULT NULL,
  `region_exclude` varchar(255) DEFAULT NULL,
  `first_order_only` tinyint(1) NOT NULL DEFAULT 0,
  `stackable` tinyint(1) NOT NULL DEFAULT 0,
  `max_uses` int(11) DEFAULT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `max_uses_per_user` int(11) DEFAULT NULL,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `description`, `discount_type`, `discount_value`, `max_discount_amount`, `min_order_amount`, `exclude_discounted_items`, `applicable_payment_methods`, `applicable_roles`, `region_include`, `region_exclude`, `first_order_only`, `stackable`, `max_uses`, `used_count`, `max_uses_per_user`, `start_date`, `end_date`, `active`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 'Giảm 10% cho đơn đầu tiên', 'percent', 10.00, 50000.00, 200000.00, 0, 'COD,e_wallet', 'Customer', NULL, NULL, 1, 0, 1000, 0, 1, '2025-08-31 17:00:00', '2025-12-31 16:59:59', 1, '2025-09-18 02:26:43', '2025-09-18 02:26:43');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_brands`
--

CREATE TABLE `coupon_brands` (
  `coupon_id` int(11) NOT NULL,
  `brand_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupon_categories`
--

CREATE TABLE `coupon_categories` (
  `coupon_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupon_products`
--

CREATE TABLE `coupon_products` (
  `coupon_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupon_uses`
--

CREATE TABLE `coupon_uses` (
  `coupon_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `imports`
--

CREATE TABLE `imports` (
  `id` int(11) NOT NULL,
  `import_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_cost` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `supplier_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `imports`
--

INSERT INTO `imports` (`id`, `import_date`, `total_cost`, `status`, `notes`, `created_at`, `supplier_id`) VALUES
(1, '2025-08-24 17:00:00', 0.00, 'completed', 'Nhập lô gấu Teddy mới', '2025-08-25 14:50:57', 1),
(2, '2025-08-24 17:00:00', 0.00, 'pending', 'Chờ kiểm tra chất lượng', '2025-08-25 14:50:57', 1),
(3, '2025-08-26 17:00:00', 2000000.00, 'pending', NULL, '2025-08-27 13:47:30', 1),
(4, '2025-08-26 17:00:00', 5210000.00, 'pending', NULL, '2025-08-27 14:31:57', 1);

-- --------------------------------------------------------

--
-- Table structure for table `import_details`
--

CREATE TABLE `import_details` (
  `id` int(11) NOT NULL,
  `import_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL CHECK (`quantity` > 0),
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `import_details`
--

INSERT INTO `import_details` (`id`, `import_id`, `product_id`, `quantity`, `unit_price`) VALUES
(4, 3, 4, 10, 200000.00),
(5, 4, 6, 13, 130000.00),
(6, 4, 4, 11, 200000.00),
(7, 4, 14, 11, 120000.00);

--
-- Triggers `import_details`
--
DELIMITER $$
CREATE TRIGGER `after_import_details_insert` AFTER INSERT ON `import_details` FOR EACH ROW BEGIN
    UPDATE products 
    SET stock = stock + NEW.quantity
    WHERE id = NEW.product_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `chat_session_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `chat_session_id`, `sender_id`, `content`, `is_read`, `created_at`) VALUES
(1, 1, 1, 'Xin chào admin!', 0, '2025-09-16 06:50:18'),
(6, 2, 36, 'Hello shop!', 0, '2025-09-16 16:36:49'),
(9, 2, 36, 'Hello nha cả yêu!', 0, '2025-09-16 09:53:30');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `type` enum('new_message','session_update') DEFAULT 'new_message',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message_id`, `type`, `is_read`, `created_at`) VALUES
(5, 1, 6, 'new_message', 0, '2025-09-16 16:36:49'),
(8, 1, 9, 'new_message', 0, '2025-09-16 09:53:30');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_date`, `status`, `total_amount`) VALUES
(1, 1, '2025-08-25 14:50:57', 'pending', 890000.00),
(2, 1, '2025-08-25 14:50:57', 'shipped', 250000.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_coupons`
--

CREATE TABLE `order_coupons` (
  `order_id` int(11) NOT NULL,
  `coupon_id` int(11) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, NULL, 2, 445000.00),
(2, 2, NULL, 1, 250000.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_shipping_vouchers`
--

CREATE TABLE `order_shipping_vouchers` (
  `order_id` int(11) NOT NULL,
  `voucher_id` int(11) NOT NULL,
  `shipping_discount_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `payment_method` enum('COD','bank_transfer','e_wallet','credit_card') DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('paid','pending','failed') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `payment_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'COD', 890000.00, '2025-08-25 14:50:57', 'pending', '2025-09-11 23:30:19', '2025-09-11 23:30:19'),
(2, 2, 'e_wallet', 250000.00, '2025-08-25 14:50:57', 'paid', '2025-09-11 23:30:19', '2025-09-11 23:30:19');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`) VALUES
(1, 'view_products', 'Xem danh sách sản phẩm'),
(2, 'add_to_cart', 'Thêm vào giỏ hàng'),
(3, 'add_to_favorites', 'Thêm vào yêu thích'),
(4, 'place_order', 'Đặt hàng'),
(5, 'view_orders', 'Xem đơn hàng của mình'),
(6, 'manage_products', 'Quản lý sản phẩm (thêm/sửa/xóa)'),
(7, 'manage_orders', 'Quản lý đơn hàng (xử lý, hủy)'),
(8, 'manage_users', 'Quản lý người dùng'),
(9, 'view_reports', 'Xem báo cáo doanh thu'),
(10, 'manage_imports', 'Quản lý phiếu nhập (tạo, sửa, xóa)'),
(11, 'view_imports', 'Xem danh sách phiếu nhập');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `brand_id` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `image_url`, `category_id`, `brand_id`, `stock`, `created_at`) VALUES
(4, 'gấu bông noel', 'hihi', 200000.00, '/uploads/1756279158686-303970204-memeandroid1.jpg', 1, 1, 43, '2025-08-27 07:05:09'),
(6, 'GẤU NÂU MỀM MẠI', 'HIHI', 130000.00, '/uploads/1756279859283-580258136-OIP (1).webp', 1, 2, 24, '2025-08-27 07:30:59'),
(7, 'GẤU NÂU MỀM MẠI', 'hhh', 130000.00, '/uploads/1756280319988-585411408-OIP (1).webp', 1, 2, 11, '2025-08-27 07:38:39'),
(8, 'GẤU BUỒN NGỦ ', 'KKK', 130000.00, '/uploads/1756280527194-32202040-OIP (2).webp', 2, 3, 11, '2025-08-27 07:42:07'),
(9, 'HỔ KAKA', 'WWWWW', 130000.00, '/uploads/1756280577416-563265173-OIP (3).webp', 2, 1, 11, '2025-08-27 07:42:57'),
(10, 'GẤU TRÚC THIẾU NGỦ', 'HHH', 120000.00, '/uploads/1756280627818-112704816-OIP (4).webp', 2, 3, 12, '2025-08-27 07:43:47'),
(11, 'GẤU TRÚC HAM ĂN', 'HHH', 130000.00, '/uploads/1756280679637-881067446-OIP9.jpg', 1, 3, 11, '2025-08-27 07:44:39'),
(12, 'GẤU DÂU ĐÁNG YÊU', 'KKKK', 210000.00, '/uploads/1756280739648-379525019-OIP (5).webp', 1, 1, 22, '2025-08-27 07:45:39'),
(13, 'THỎ ĐÀO NGỌT NGÀO', 'HHH', 210000.00, '/uploads/1756280802618-785400663-OIP (7).webp', 1, 3, 22, '2025-08-27 07:46:42'),
(14, 'TIỂU ĐÀO ĐÀO', 'HHH', 120000.00, '/uploads/1756280863080-210403397-OIP (6).webp', 2, 3, 22, '2025-08-27 07:47:43'),
(19, 'Gấu mèo', 'sự dễ thương nhất', 120000.00, '', 5, 4, 20, '2025-09-16 02:52:29');

-- --------------------------------------------------------

--
-- Table structure for table `product_attributes`
--

CREATE TABLE `product_attributes` (
  `product_id` int(11) NOT NULL,
  `attribute_id` int(11) NOT NULL,
  `value` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_attributes`
--

INSERT INTO `product_attributes` (`product_id`, `attribute_id`, `value`) VALUES
(4, 1, 'Đỏ, Trắng'),
(4, 2, 'XL'),
(4, 3, 'Vải bông'),
(4, 4, 'Gấu'),
(4, 5, 'Dễ thương'),
(4, 6, 'Trẻ em'),
(6, 1, 'Nâu'),
(6, 2, '35cm'),
(6, 3, 'Vải nhung'),
(6, 4, 'Gấu'),
(6, 5, 'Hiện đại'),
(6, 6, 'Người lớn'),
(7, 1, 'Nâu'),
(7, 2, '30cm'),
(7, 3, 'Len'),
(7, 4, 'Gấu'),
(7, 5, 'Dễ thương'),
(7, 6, 'Trẻ em'),
(8, 1, 'Xám'),
(8, 2, '25cm'),
(8, 3, 'Vải bông'),
(8, 4, 'Gấu'),
(8, 5, 'Cổ điển'),
(8, 6, 'Tặng quà'),
(9, 1, 'Cam'),
(9, 2, '40cm'),
(9, 3, 'Vải nhung'),
(9, 4, 'Hổ'),
(9, 5, 'Dễ thương'),
(9, 6, 'Trẻ em'),
(10, 1, 'Đen, Trắng'),
(10, 2, '30cm'),
(10, 3, 'Len'),
(10, 4, 'Gấu trúc'),
(10, 5, 'Dễ thương'),
(10, 6, 'Trẻ em'),
(11, 1, 'Đen, Trắng'),
(11, 2, '35cm'),
(11, 3, 'Vải bông'),
(11, 4, 'Gấu trúc'),
(11, 5, 'Dễ thương'),
(11, 6, 'Tặng quà'),
(12, 1, 'Hồng'),
(12, 2, '40cm'),
(12, 3, 'Vải nhung'),
(12, 4, 'Gấu'),
(12, 5, 'Dễ thương'),
(12, 6, 'Trẻ em'),
(13, 1, 'Hồng'),
(13, 2, '35cm'),
(13, 3, 'Len'),
(13, 4, 'Thỏ'),
(13, 5, 'Dễ thương'),
(13, 6, 'Tặng quà'),
(14, 1, 'Hồng'),
(14, 2, '35cm'),
(14, 3, 'Vải nhung'),
(14, 4, 'Thỏ'),
(14, 5, 'Dễ thương'),
(14, 6, 'Tặng quà'),
(19, 1, 'đỏ');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `review_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `rating`, `comment`, `review_date`) VALUES
(3, 4, 1, 5, 'Gấu bông Noel rất dễ thương, chất liệu mềm mại, phù hợp làm quà tặng!', '2025-09-14 10:00:00'),
(4, 4, 26, 4, 'Sản phẩm đẹp, nhưng giao hàng hơi chậm.', '2025-09-14 10:05:00'),
(6, 6, 29, 3, 'Gấu nâu mềm, nhưng màu hơi khác so với hình.', '2025-09-14 10:15:00'),
(7, 10, 33, 4, 'Gấu trúc nhìn buồn ngủ rất ngộ nghĩnh, chất lượng tốt.', '2025-09-14 10:20:00'),
(8, 14, 1, 5, 'Thỏ đào đáng yêu, mua tặng bạn gái rất hợp!', '2025-09-14 10:25:00');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Customer', 'Khách hàng thông thường'),
(2, 'mèo méo meo', 'Nhà bán hàng quản lý sản phẩm'),
(3, 'Admin', 'Quản trị viên toàn quyền'),
(4, 'MANAGER', NULL),
(5, 'đẹp trai', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`, `id`) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
(1, 4, 4),
(1, 5, 5),
(2, 3, 34),
(2, 6, 35),
(2, 7, 36),
(2, 10, 37),
(2, 11, 38),
(3, 1, 11),
(3, 2, 12),
(4, 1, 13),
(4, 2, 14),
(4, 4, 15),
(4, 5, 16),
(5, 1, 39);

-- --------------------------------------------------------

--
-- Table structure for table `shipping`
--

CREATE TABLE `shipping` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `shipping_method` varchar(100) DEFAULT NULL,
  `tracking_number` varchar(50) DEFAULT NULL,
  `shipped_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipping`
--

INSERT INTO `shipping` (`id`, `order_id`, `address`, `shipping_method`, `tracking_number`, `shipped_date`) VALUES
(1, 1, '123 Đường Láng, Hà Nội', 'GHTK', 'GH12345', '2025-08-25 14:50:57'),
(2, 2, '123 Đường Láng, Hà Nội', 'Viettel Post', 'VT67890', '2025-08-25 14:50:57');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_vouchers`
--

CREATE TABLE `shipping_vouchers` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('free','percent','fixed') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `min_order_amount` decimal(10,2) DEFAULT NULL,
  `min_shipping_fee` decimal(10,2) DEFAULT NULL,
  `applicable_carriers` varchar(255) DEFAULT NULL,
  `region_include` varchar(255) DEFAULT NULL,
  `region_exclude` varchar(255) DEFAULT NULL,
  `max_uses` int(11) DEFAULT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `max_uses_per_user` int(11) DEFAULT NULL,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipping_vouchers`
--

INSERT INTO `shipping_vouchers` (`id`, `code`, `description`, `discount_type`, `discount_value`, `max_discount_amount`, `min_order_amount`, `min_shipping_fee`, `applicable_carriers`, `region_include`, `region_exclude`, `max_uses`, `used_count`, `max_uses_per_user`, `start_date`, `end_date`, `active`, `created_at`, `updated_at`) VALUES
(1, 'FREESHIPHN', 'Miễn phí ship nội thành Hà Nội', 'free', 0.00, NULL, 150000.00, 15000.00, 'GHTK,Viettel Post', 'Hà Nội', NULL, 500, 0, 3, '2025-08-31 17:00:00', '2025-12-31 16:59:59', 1, '2025-09-18 02:26:14', '2025-09-18 02:26:14');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_voucher_uses`
--

CREATE TABLE `shipping_voucher_uses` (
  `voucher_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `phone`, `email`, `address`, `created_at`, `updated_at`) VALUES
(1, 'công ty trách nhiệm hữu hạn một mình tao', 'phùng thị trang', '0349459165', 'phungtrang19012004@gmail.com', 'fffffff', '2025-08-27 13:46:25', '2025-08-27 13:47:03');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `address`, `phone`, `created_at`) VALUES
(1, 'khachhang1', 'hashed_pass1', 'khachhang1@example.com', '123 Đường Láng, Hà Nội', '0901234567', '2025-08-25 14:50:57'),
(2, 'seller1', 'hashed_pass2', 'seller1@example.com', '456 Nguyễn Huệ, TP.HCM', '0912345678', '2025-08-25 14:50:57'),
(3, 'admin1', 'hashed_pass3', 'admin1@example.com', '789 Lê Lợi, Đà Nẵng', '0923456789', '2025-08-25 14:50:57'),
(4, 'trangtrang', '$2b$10$dIvyvZ4yYNA82C.IPksJnOnF9mmMNtwMdCthgOAuo1StQC0x8qdqm', 'phungtrang19012004@gmail.com', 'fffffff', '0349459165', '2025-08-26 03:52:55'),
(8, 'geoserver', '1', 'pwea@gmail.com', 'ss', '0368498289', '2025-08-26 05:16:11'),
(10, 'ad', '1', 'banh@gmail.com', 'ss', '0368498289', '2025-08-26 05:23:50'),
(12, 'ad', '1', 'anh@gmail.com', 'ss', '0368498289', '2025-08-26 05:31:59'),
(16, 'ad', '1', 'affnh@gmail.com', 'ss', '0368498289', '2025-08-26 05:45:47'),
(21, 'ad', '1', 'nh@gmail.com', 'ss', '0368498289', '2025-08-26 05:53:21'),
(23, 'ad', '1', 'nhi@gmail.com', 'ss', '0368498289', '2025-08-26 05:57:18'),
(24, 'ad', '1', 'nhie@gmail.com', 'ss', '0368498289', '2025-08-26 05:59:33'),
(25, 'ad', '1', 'nhien@gmail.com', 'ss', '0368498289', '2025-08-26 07:27:57'),
(26, 'customer', '1', 'customer@test', 'hanoi', '0349459165', '2025-08-26 14:19:39'),
(27, 'admin', '1', 'admin@test', 'hanoi', '03', '2025-08-26 14:20:23'),
(28, 'lua', '123', 'lua@gmail.com', NULL, NULL, '2025-09-10 11:49:44'),
(29, 'trang', '123', 'trang@gmail.com', NULL, NULL, '2025-09-10 12:34:00'),
(30, 'Nguyen Van A', '$2a$10$jg4lUFNGWYbrqETGuMhBuusX.KdbfQIbmcgNjoI8vT/EYXHxBvh/.', 'abc@gmail.com', NULL, NULL, '2025-09-10 14:24:35'),
(31, 'tien dat', '$2a$10$Jbw9XjQiRYzNa7TVbdihyuO59SBI56UgGTNbYJinZ37g.93UXIT.i', 'a@gmail.com', NULL, NULL, '2025-09-10 14:58:31'),
(32, 'Nguyen Van A', '$2a$10$grUUt5EDoYTpU0AZ4i6GjO9tn8vbxI3oBBauviwknkouOWt24uyvG', 'aaa@gmail.com', NULL, NULL, '2025-09-10 15:16:34'),
(33, 'khachhang_test', '$2a$10$gy1jz2u5ZuXWC14tB4B1i.8kvTEt.LMKV8LjQTMgMZjGS7IXXsR32', 'khachhang_test@example.com', '123 Hà Nội', '0909999999', '2025-09-11 01:47:29'),
(34, 'ad', '$2a$10$527LwUd3c3shgkMpfowDg.DNiiM7Cy4NfwYBxpJLCIbeuw1oOgYsO', 'phu19012004@gmail.com', 'fffffff', '0349459165', '2025-09-11 13:24:45'),
(35, 'tiendat', '$2a$10$Hh05Mbc2C/i5cgwqKUhZ5OpjpUa9/m6nTv111/YMxhNXwpzBck55C', 'atest@example.com', NULL, NULL, '2025-09-11 14:19:56'),
(36, 'tiendatngu', '$2a$10$iqs9cMI36IfRmgr9l/PjvORx.1v919EsLp5yYKyqAyqENxKVgCO8u', 'tiendat9012004@gmail.com', 'ha noi', '0349459165', '2025-09-11 14:29:02'),
(37, 'tiendatngu', '$2a$10$tOmpK/6WzSSG3Iya/O1H2epxi.Dmy1i3IuU.BO7YTNP7nFtfoQZq2', 'dat9012004@gmail.com', 'fffffff', '0349459165', '2025-09-11 16:54:02');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`) VALUES
(5, 30, 1),
(6, 30, 2),
(4, 30, 3),
(1, 36, 2),
(2, 37, 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attributes`
--
ALTER TABLE `attributes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_participants` (`participant1_id`,`participant2_id`),
  ADD KEY `idx_participant1` (`participant1_id`),
  ADD KEY `idx_participant2` (`participant2_id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_coupon_code` (`code`),
  ADD KEY `idx_coupon_active_window` (`active`,`start_date`,`end_date`);

--
-- Indexes for table `coupon_brands`
--
ALTER TABLE `coupon_brands`
  ADD PRIMARY KEY (`coupon_id`,`brand_id`),
  ADD KEY `fk_cb_brand` (`brand_id`);

--
-- Indexes for table `coupon_categories`
--
ALTER TABLE `coupon_categories`
  ADD PRIMARY KEY (`coupon_id`,`category_id`),
  ADD KEY `fk_cc_cate` (`category_id`);

--
-- Indexes for table `coupon_products`
--
ALTER TABLE `coupon_products`
  ADD PRIMARY KEY (`coupon_id`,`product_id`),
  ADD KEY `fk_cp_product` (`product_id`);

--
-- Indexes for table `coupon_uses`
--
ALTER TABLE `coupon_uses`
  ADD PRIMARY KEY (`coupon_id`,`user_id`),
  ADD KEY `fk_cu_user` (`user_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorite` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `imports`
--
ALTER TABLE `imports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `import_details`
--
ALTER TABLE `import_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `import_id` (`import_id`),
  ADD KEY `idx_import_details_product` (`product_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session` (`chat_session_id`),
  ADD KEY `idx_sender` (`sender_id`),
  ADD KEY `idx_unread` (`is_read`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_message` (`message_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_order_status` (`status`);

--
-- Indexes for table `order_coupons`
--
ALTER TABLE `order_coupons`
  ADD PRIMARY KEY (`order_id`,`coupon_id`),
  ADD KEY `fk_oc_coupon` (`coupon_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `order_shipping_vouchers`
--
ALTER TABLE `order_shipping_vouchers`
  ADD PRIMARY KEY (`order_id`,`voucher_id`),
  ADD KEY `fk_osv_voucher` (`voucher_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `brand_id` (`brand_id`),
  ADD KEY `idx_product_name` (`name`);

--
-- Indexes for table `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD PRIMARY KEY (`product_id`,`attribute_id`),
  ADD KEY `attribute_id` (`attribute_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_role_perm` (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`),
  ADD KEY `idx_rp_role` (`role_id`),
  ADD KEY `idx_rp_perm` (`permission_id`);

--
-- Indexes for table `shipping`
--
ALTER TABLE `shipping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `shipping_vouchers`
--
ALTER TABLE `shipping_vouchers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_ship_voucher_code` (`code`),
  ADD KEY `idx_ship_voucher_active_window` (`active`,`start_date`,`end_date`);

--
-- Indexes for table `shipping_voucher_uses`
--
ALTER TABLE `shipping_voucher_uses`
  ADD PRIMARY KEY (`voucher_id`,`user_id`),
  ADD KEY `fk_svu_user` (`user_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_roles_user_role` (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attributes`
--
ALTER TABLE `attributes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `imports`
--
ALTER TABLE `imports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `import_details`
--
ALTER TABLE `import_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `shipping`
--
ALTER TABLE `shipping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shipping_vouchers`
--
ALTER TABLE `shipping_vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD CONSTRAINT `chat_sessions_ibfk_1` FOREIGN KEY (`participant1_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_sessions_ibfk_2` FOREIGN KEY (`participant2_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coupon_brands`
--
ALTER TABLE `coupon_brands`
  ADD CONSTRAINT `fk_cb_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cb_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coupon_categories`
--
ALTER TABLE `coupon_categories`
  ADD CONSTRAINT `fk_cc_cate` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cc_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coupon_products`
--
ALTER TABLE `coupon_products`
  ADD CONSTRAINT `fk_cp_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cp_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coupon_uses`
--
ALTER TABLE `coupon_uses`
  ADD CONSTRAINT `fk_cu_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cu_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `imports`
--
ALTER TABLE `imports`
  ADD CONSTRAINT `imports_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `import_details`
--
ALTER TABLE `import_details`
  ADD CONSTRAINT `import_details_ibfk_1` FOREIGN KEY (`import_id`) REFERENCES `imports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `import_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`chat_session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_coupons`
--
ALTER TABLE `order_coupons`
  ADD CONSTRAINT `fk_oc_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_oc_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_shipping_vouchers`
--
ALTER TABLE `order_shipping_vouchers`
  ADD CONSTRAINT `fk_osv_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_osv_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `shipping_vouchers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD CONSTRAINT `product_attributes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_attributes_ibfk_2` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipping`
--
ALTER TABLE `shipping`
  ADD CONSTRAINT `shipping_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipping_voucher_uses`
--
ALTER TABLE `shipping_voucher_uses`
  ADD CONSTRAINT `fk_svu_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_svu_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `shipping_vouchers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
ALTER TABLE products
ADD COLUMN supplier_id INT NULL,
ADD CONSTRAINT fk_products_supplier
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    ON DELETE SET NULL ON UPDATE CASCADE;
