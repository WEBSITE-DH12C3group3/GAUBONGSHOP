-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 11, 2025 at 04:09 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
(1, 'Teddy', 'Thương hiệu gấu bông cao cấp', '/brandimg/1758470140264-6474298538122326766-download-3-.jpg', 'https://www.teddy.it/en/home/', '2025-08-25 14:50:57'),
(2, 'Kuromi', 'Thương hiệu thú bông nhân vật hoạt hình', '/brandimg/1758470089967-7502343142001979517-download-2-.jpg', 'https://kuromi.co.uk/what-animal-is-kuromi/', '2025-08-25 14:50:57'),
(3, 'OEM', 'Thương hiệu sản xuất chung', '/brandimg/1758470050822-5581011938948658606-download-1-.jpg', 'https://thunhoibongthanhdat.com/', '2025-08-25 14:50:57'),
(4, 'Steiff', 'Hãng gấu bông cao cấp đến từ Đức', '/brandimg/1758470000060-7755539213327187156-OIP.jpg', 'https://www.steiff.com/en', '2025-08-27 08:47:07'),
(5, 'Kẹo ngọt', 'Gấu xinh mềm mại', '/brandimg/1758465449927-9019866415158050303-brandstuffed.jpg', 'https://www.buildabear.com/', '2025-09-21 07:37:37'),
(6, 'Jellycat', 'Thương hiệu gấu bông siêu mềm mại', '/brandimg/1758465607659-437977114948579399-download.jpg', 'https://www.jellycat.com/', '2025-09-21 07:40:19'),
(7, 'Charlie Bears', 'Thương hiệu chuyên về gấu bông sưu tầm với thiết kế tỉ mỉ, có hồn và giới hạn số lượng', '/brandimg/1758465768750-7353927941000966383-images.jpg', 'https://www.charliebears.com/', '2025-09-21 07:43:22');

-- --------------------------------------------------------

--
-- Table structure for table `carrier_rate_rules`
--

CREATE TABLE `carrier_rate_rules` (
  `id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `min_km` decimal(8,2) NOT NULL DEFAULT 0.00,
  `max_km` decimal(8,2) DEFAULT NULL,
  `base_fee` decimal(12,2) NOT NULL,
  `per_km_fee` decimal(12,2) NOT NULL,
  `min_fee` decimal(12,2) DEFAULT 0.00,
  `free_km` decimal(8,2) DEFAULT 0.00,
  `cod_surcharge` decimal(12,2) DEFAULT 0.00,
  `area_surcharge` decimal(12,2) DEFAULT 0.00,
  `active_from` date DEFAULT NULL,
  `active_to` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carrier_rate_rules`
--

INSERT INTO `carrier_rate_rules` (`id`, `service_id`, `min_km`, `max_km`, `base_fee`, `per_km_fee`, `min_fee`, `free_km`, `cod_surcharge`, `area_surcharge`, `active_from`, `active_to`, `is_active`) VALUES
(1, 1, 0.00, 5.00, 15000.00, 2000.00, 15000.00, 1.00, 0.00, 0.00, NULL, NULL, 1),
(2, 1, 5.00, 20.00, 20000.00, 3000.00, 25000.00, 0.00, 0.00, 0.00, NULL, NULL, 1),
(3, 1, 20.00, NULL, 30000.00, 4000.00, 40000.00, 0.00, 0.00, 0.00, NULL, NULL, 1),
(4, 2, 1.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-09-28', '2025-09-30', 1),
(5, 3, 2.00, 4.00, 0.00, 10000.00, 0.00, 0.00, 0.00, 0.00, '2025-09-28', '2025-10-04', 1);

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `selected` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `product_id`, `quantity`, `selected`, `created_at`) VALUES
(5, 43, 13, 1, 1, '2025-09-22 21:32:12'),
(6, 43, 12, 1, 0, '2025-09-22 21:32:13'),
(7, 42, 13, 2, 1, '2025-09-23 02:35:15'),
(8, 38, 13, 1, 1, '2025-09-23 14:47:17'),
(9, 4, 11, 1, 1, '2025-09-24 13:26:24'),
(10, 37, 13, 1, 1, '2025-09-25 03:21:42'),
(11, 37, 12, 1, 1, '2025-09-25 03:21:44'),
(12, 42, 14, 1, 1, '2025-09-26 02:32:46'),
(13, 42, 12, 1, 1, '2025-09-26 02:32:53'),
(14, 42, 9, 1, 1, '2025-09-26 02:32:58'),
(21, 44, 4, 3, 1, '2025-09-29 16:44:18'),
(22, 44, 12, 1, 1, '2025-09-30 07:45:40');

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
(1, 1, 3, 'open', '2025-09-16 06:50:18', '2025-09-19 01:09:31'),
(2, 1, 36, 'closed', '2025-09-16 16:10:19', '2025-09-19 01:09:14'),
(3, 30, 1, 'open', '2025-09-18 10:02:04', '2025-09-19 01:08:24'),
(4, 37, 1, 'closed', '2025-09-18 16:55:08', '2025-09-19 01:08:10'),
(5, 36, 1, 'open', '2025-09-20 06:50:34', '2025-09-20 06:50:34'),
(6, 42, 1, 'open', '2025-09-20 06:51:54', '2025-09-20 08:51:27'),
(7, 4, 1, 'open', '2025-09-21 06:26:29', '2025-09-21 06:26:29'),
(8, 38, 1, 'open', '2025-09-21 06:32:52', '2025-09-21 06:32:52'),
(9, 43, 1, 'open', '2025-09-22 10:56:08', '2025-09-22 10:56:08'),
(10, 44, 1, 'open', '2025-09-26 09:02:47', '2025-09-26 13:54:53'),
(11, 41, 1, 'open', '2025-09-30 00:31:05', '2025-09-30 00:55:27');

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
-- Table structure for table `distance_cache`
--

CREATE TABLE `distance_cache` (
  `id` bigint(20) NOT NULL,
  `from_lat` decimal(10,7) NOT NULL,
  `from_lng` decimal(10,7) NOT NULL,
  `to_lat` decimal(10,7) NOT NULL,
  `to_lng` decimal(10,7) NOT NULL,
  `distance_km` decimal(8,2) NOT NULL,
  `source` enum('DRIVING','HAVERSINE') NOT NULL DEFAULT 'HAVERSINE',
  `cached_at` timestamp NOT NULL DEFAULT current_timestamp()
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

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(3, 37, 13, '2025-09-21 12:21:13'),
(7, 42, 11, '2025-09-25 19:30:29'),
(8, 42, 12, '2025-09-25 19:30:30'),
(9, 44, 12, '2025-09-30 00:45:21');

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
(1, 1, 1, 'Xin chào admin!', 1, '2025-09-16 06:50:18'),
(6, 2, 36, 'Hello shop!', 1, '2025-09-16 16:36:49'),
(9, 2, 36, 'Hello nha cả yêu!', 1, '2025-09-16 09:53:30'),
(11, 3, 30, 'Xin chào shop!', 1, '2025-09-18 10:23:12'),
(12, 3, 37, 'Shop xin chào bạn ạ!', 0, '2025-09-18 10:41:05'),
(13, 3, 30, 'hello', 1, '2025-09-18 13:55:12'),
(14, 3, 30, 'shop owi', 1, '2025-09-18 13:56:21'),
(15, 2, 36, 'ê bà', 1, '2025-09-18 16:51:17'),
(16, 4, 37, 'chào', 0, '2025-09-18 16:55:26'),
(17, 4, 37, 'chào', 0, '2025-09-18 16:55:29'),
(18, 4, 37, 'ê m', 0, '2025-09-18 16:55:37'),
(19, 2, 37, 'tôi đây', 1, '2025-09-19 03:41:45'),
(20, 2, 36, 'khỏe không', 1, '2025-09-19 03:42:32'),
(21, 4, 37, 'tao đây', 0, '2025-09-19 03:43:55'),
(22, 2, 36, 'ê', 1, '2025-09-19 03:56:41'),
(23, 2, 36, 'ê', 1, '2025-09-19 03:57:02'),
(24, 2, 30, 'ê', 1, '2025-09-19 03:59:03'),
(25, 2, 30, 'ê', 1, '2025-09-19 03:59:31'),
(26, 3, 37, 'đây nha\\', 0, '2025-09-19 04:00:28'),
(27, 3, 37, 'hh', 0, '2025-09-19 04:05:15'),
(28, 2, 30, 'dfgh', 1, '2025-09-19 04:05:45'),
(29, 3, 37, 'chào nhá', 0, '2025-09-19 04:12:43'),
(30, 2, 30, 'hú', 1, '2025-09-19 04:14:17'),
(31, 2, 30, 'hú', 1, '2025-09-19 04:14:22'),
(32, 2, 30, 'ê ê', 1, '2025-09-19 04:18:23'),
(33, 2, 30, 'ê', 1, '2025-09-19 04:18:26'),
(34, 2, 30, 'hello', 1, '2025-09-19 07:36:54'),
(35, 2, 30, 'chào nhé', 1, '2025-09-19 07:37:01'),
(36, 3, 37, 'cin chao', 0, '2025-09-19 07:37:49'),
(37, 3, 37, 'hi', 0, '2025-09-19 07:40:05'),
(38, 2, 36, 'hello', 1, '2025-09-19 07:42:43'),
(39, 3, 37, 'ê', 0, '2025-09-19 08:08:24'),
(40, 2, 30, 'chài]', 1, '2025-09-19 08:09:12'),
(41, 2, 30, 'adfhiusafguia', 1, '2025-09-19 08:09:14'),
(42, 1, 37, 'ddda', 0, '2025-09-19 08:09:30'),
(43, 6, 42, 'chào shop', 1, '2025-09-20 13:52:18'),
(44, 6, 42, 'chop cho mình hỏi', 1, '2025-09-20 13:52:33'),
(45, 6, 37, 'mình đây bạn ơi', 1, '2025-09-20 13:52:52'),
(46, 6, 42, 'bạn ơi', 1, '2025-09-20 13:57:48'),
(47, 6, 42, 'bạn ơi', 1, '2025-09-20 13:58:06'),
(48, 6, 42, 'ê', 1, '2025-09-20 13:58:10'),
(49, 6, 37, 'đây đĩ mẹ m', 1, '2025-09-20 13:58:29'),
(50, 6, 42, 'con chó', 1, '2025-09-20 13:59:05'),
(51, 6, 37, 'm thích gì', 1, '2025-09-20 14:00:59'),
(52, 6, 42, 'á à', 1, '2025-09-20 14:01:26'),
(53, 6, 37, 'heloo', 1, '2025-09-20 14:10:55'),
(54, 6, 42, 'xin lỗi tao đi', 1, '2025-09-20 14:11:20'),
(55, 6, 37, 'del thích', 1, '2025-09-20 14:26:10'),
(56, 6, 37, 'ê', 1, '2025-09-20 14:29:11'),
(57, 6, 37, 'ê', 1, '2025-09-20 14:29:13'),
(58, 6, 37, 'dfhasdhfsaiu', 1, '2025-09-20 14:29:17'),
(59, 6, 37, 'dfuid', 1, '2025-09-20 14:29:20'),
(60, 6, 37, 'ê m', 1, '2025-09-20 14:44:57'),
(61, 6, 42, 'sdfasdhfioas', 1, '2025-09-20 14:55:55'),
(62, 6, 37, 'đù mé', 1, '2025-09-20 15:00:13'),
(63, 6, 37, 'húdhksdhjkaddsbjsadk', 1, '2025-09-20 15:30:15'),
(64, 6, 42, 'djfhsf', 1, '2025-09-20 15:30:50'),
(65, 6, 37, 'ê', 1, '2025-09-20 15:51:08'),
(66, 6, 37, 'tao bảo', 1, '2025-09-20 15:51:13'),
(67, 6, 42, 'oiioi', 1, '2025-09-20 15:51:27'),
(68, 10, 44, 'chào shop', 1, '2025-09-26 16:19:24'),
(69, 10, 37, 'chào bạn nha', 1, '2025-09-26 16:20:09'),
(70, 10, 44, 'shop cho mình hỏi địa chỉ ở đâu vậy', 1, '2025-09-26 16:20:31'),
(71, 10, 37, 'mình ở hà nội', 1, '2025-09-26 16:20:45'),
(72, 10, 37, '320 phú diễn ạ', 1, '2025-09-26 16:20:58'),
(73, 10, 44, 'hello', 1, '2025-09-26 20:22:50'),
(74, 10, 44, 'hello', 1, '2025-09-26 20:22:56'),
(75, 10, 44, 'hello', 1, '2025-09-26 20:26:58'),
(76, 10, 44, 'hello', 1, '2025-09-26 20:28:00'),
(77, 10, 44, 'e', 1, '2025-09-26 20:29:01'),
(78, 10, 37, 'hjfie', 1, '2025-09-26 20:48:34'),
(79, 10, 44, 'èwefr', 1, '2025-09-26 20:48:42'),
(80, 10, 37, 'tao đây', 1, '2025-09-26 20:49:32'),
(81, 10, 37, 'tjhdbfvuih', 1, '2025-09-26 20:49:38'),
(82, 10, 37, 'mẹ m', 1, '2025-09-26 20:49:43'),
(83, 10, 37, 'tao đấy', 1, '2025-09-26 20:54:53'),
(84, 11, 41, 'hjdfgjday', 0, '2025-09-30 07:55:27');

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
(8, 1, 9, 'new_message', 0, '2025-09-16 09:53:30'),
(10, 1, 11, 'new_message', 0, '2025-09-18 10:23:12'),
(11, 30, 12, 'new_message', 1, '2025-09-18 10:41:05'),
(12, 1, 13, 'new_message', 0, '2025-09-18 13:55:12'),
(13, 1, 14, 'new_message', 0, '2025-09-18 13:56:21'),
(14, 1, 15, 'new_message', 0, '2025-09-18 16:51:17'),
(15, 1, 16, 'new_message', 0, '2025-09-18 16:55:26'),
(16, 1, 17, 'new_message', 0, '2025-09-18 16:55:29'),
(17, 1, 18, 'new_message', 0, '2025-09-18 16:55:37'),
(18, 1, 19, 'new_message', 0, '2025-09-19 03:41:45'),
(19, 1, 20, 'new_message', 0, '2025-09-19 03:42:32'),
(20, 1, 21, 'new_message', 0, '2025-09-19 03:43:55'),
(21, 1, 22, 'new_message', 0, '2025-09-19 03:56:41'),
(22, 1, 23, 'new_message', 0, '2025-09-19 03:57:02'),
(23, 36, 24, 'new_message', 0, '2025-09-19 03:59:03'),
(24, 36, 25, 'new_message', 0, '2025-09-19 03:59:31'),
(25, 30, 26, 'new_message', 1, '2025-09-19 04:00:28'),
(26, 30, 27, 'new_message', 1, '2025-09-19 04:05:15'),
(27, 36, 28, 'new_message', 0, '2025-09-19 04:05:45'),
(28, 30, 29, 'new_message', 1, '2025-09-19 04:12:43'),
(29, 36, 30, 'new_message', 0, '2025-09-19 04:14:17'),
(30, 36, 31, 'new_message', 0, '2025-09-19 04:14:22'),
(31, 36, 32, 'new_message', 0, '2025-09-19 04:18:23'),
(32, 36, 33, 'new_message', 0, '2025-09-19 04:18:26'),
(33, 36, 34, 'new_message', 0, '2025-09-19 07:36:54'),
(34, 36, 35, 'new_message', 0, '2025-09-19 07:37:01'),
(35, 30, 36, 'new_message', 1, '2025-09-19 07:37:49'),
(36, 30, 37, 'new_message', 1, '2025-09-19 07:40:05'),
(37, 1, 38, 'new_message', 0, '2025-09-19 07:42:43'),
(38, 30, 39, 'new_message', 1, '2025-09-19 08:08:24'),
(39, 36, 40, 'new_message', 0, '2025-09-19 08:09:12'),
(40, 36, 41, 'new_message', 0, '2025-09-19 08:09:14'),
(41, 1, 42, 'new_message', 0, '2025-09-19 08:09:30'),
(42, 1, 43, 'new_message', 0, '2025-09-20 13:52:18'),
(43, 1, 44, 'new_message', 0, '2025-09-20 13:52:33'),
(44, 42, 45, 'new_message', 1, '2025-09-20 13:52:52'),
(45, 1, 46, 'new_message', 0, '2025-09-20 13:57:48'),
(46, 1, 47, 'new_message', 0, '2025-09-20 13:58:06'),
(47, 1, 48, 'new_message', 0, '2025-09-20 13:58:10'),
(48, 42, 49, 'new_message', 1, '2025-09-20 13:58:29'),
(49, 1, 50, 'new_message', 0, '2025-09-20 13:59:05'),
(50, 42, 51, 'new_message', 1, '2025-09-20 14:00:59'),
(51, 1, 52, 'new_message', 0, '2025-09-20 14:01:26'),
(52, 42, 53, 'new_message', 1, '2025-09-20 14:10:55'),
(53, 1, 54, 'new_message', 0, '2025-09-20 14:11:20'),
(54, 42, 55, 'new_message', 1, '2025-09-20 14:26:10'),
(55, 42, 56, 'new_message', 1, '2025-09-20 14:29:11'),
(56, 42, 57, 'new_message', 1, '2025-09-20 14:29:13'),
(57, 42, 58, 'new_message', 1, '2025-09-20 14:29:17'),
(58, 42, 59, 'new_message', 1, '2025-09-20 14:29:20'),
(59, 42, 60, 'new_message', 1, '2025-09-20 14:44:57'),
(60, 1, 61, 'new_message', 0, '2025-09-20 14:55:55'),
(61, 42, 62, 'new_message', 1, '2025-09-20 15:00:13'),
(62, 42, 63, 'new_message', 1, '2025-09-20 15:30:15'),
(63, 1, 64, 'new_message', 0, '2025-09-20 15:30:50'),
(64, 42, 65, 'new_message', 1, '2025-09-20 15:51:08'),
(65, 42, 66, 'new_message', 1, '2025-09-20 15:51:13'),
(66, 1, 67, 'new_message', 0, '2025-09-20 15:51:27'),
(67, 1, 68, 'new_message', 0, '2025-09-26 16:19:24'),
(68, 44, 69, 'new_message', 1, '2025-09-26 16:20:10'),
(69, 1, 70, 'new_message', 0, '2025-09-26 16:20:31'),
(70, 44, 71, 'new_message', 1, '2025-09-26 16:20:45'),
(71, 44, 72, 'new_message', 1, '2025-09-26 16:20:58'),
(72, 1, 73, 'new_message', 0, '2025-09-26 20:22:50'),
(73, 1, 74, 'new_message', 0, '2025-09-26 20:22:56'),
(74, 1, 75, 'new_message', 0, '2025-09-26 20:26:58'),
(75, 1, 76, 'new_message', 0, '2025-09-26 20:28:00'),
(76, 1, 77, 'new_message', 0, '2025-09-26 20:29:01'),
(77, 44, 78, 'new_message', 1, '2025-09-26 20:48:34'),
(78, 1, 79, 'new_message', 0, '2025-09-26 20:48:42'),
(79, 44, 80, 'new_message', 1, '2025-09-26 20:49:32'),
(80, 44, 81, 'new_message', 1, '2025-09-26 20:49:38'),
(81, 44, 82, 'new_message', 1, '2025-09-26 20:49:43'),
(82, 44, 83, 'new_message', 1, '2025-09-26 20:54:53'),
(83, 1, 84, 'new_message', 0, '2025-09-30 07:55:27');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `shipping_address_id` int(11) DEFAULT NULL,
  `shipping_carrier_id` int(11) DEFAULT NULL,
  `shipping_service_id` int(11) DEFAULT NULL,
  `shipping_distance_km` decimal(8,2) DEFAULT NULL,
  `shipping_fee_before` decimal(12,2) DEFAULT NULL,
  `shipping_discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `grand_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `voucher_code` varchar(50) DEFAULT NULL,
  `receiver_name` varchar(120) NOT NULL DEFAULT '',
  `phone` varchar(20) NOT NULL DEFAULT '',
  `address_line` varchar(255) NOT NULL DEFAULT '',
  `province` varchar(100) NOT NULL DEFAULT '',
  `weight_kg` decimal(12,3) NOT NULL DEFAULT 0.000,
  `shipping_fee_final` decimal(12,2) DEFAULT NULL,
  `shipping_eta_min` int(11) DEFAULT NULL,
  `shipping_eta_max` int(11) DEFAULT NULL,
  `shipping_quote_id` bigint(20) DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('PENDING_PAYMENT','PAID','PACKING','SHIPPED','DELIVERED','CANCELED') NOT NULL DEFAULT 'PENDING_PAYMENT',
  `items_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `shipping_fee` decimal(12,2) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `shipping_address_id`, `shipping_carrier_id`, `shipping_service_id`, `shipping_distance_km`, `shipping_fee_before`, `shipping_discount`, `grand_total`, `voucher_code`, `receiver_name`, `phone`, `address_line`, `province`, `weight_kg`, `shipping_fee_final`, `shipping_eta_min`, `shipping_eta_max`, `shipping_quote_id`, `order_date`, `status`, `items_total`, `shipping_fee`, `total_amount`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, '', '', '', '', 0.000, NULL, NULL, NULL, NULL, '2025-08-25 14:50:57', 'PENDING_PAYMENT', 0.00, NULL, 890000.00),
(2, 1, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, '', '', '', '', 0.000, NULL, NULL, NULL, NULL, '2025-08-25 14:50:57', 'CANCELED', 0.00, NULL, 250000.00),
(3, 44, NULL, NULL, NULL, 2.44, 17880.00, 0.00, 547880.00, NULL, 'Nguyễn Văn A', '0900000000', '12 Ngõ 34 Xã Đàn', 'Hà Nội', 1.100, 17880.00, NULL, NULL, NULL, '2025-09-28 05:39:27', 'CANCELED', 530000.00, 17880.00, 547880.00),
(4, 44, NULL, NULL, NULL, 2.44, 17880.00, 0.00, 547880.00, NULL, 'Nguyễn Văn A', '0900000000', '12 Ngõ 34 Xã Đàn', 'Hà Nội', 1.100, 17880.00, NULL, NULL, NULL, '2025-09-28 05:44:30', 'PENDING_PAYMENT', 530000.00, 17880.00, 547880.00),
(5, 44, NULL, NULL, NULL, 3.39, 19780.00, 0.00, 909780.00, NULL, 'phùng thị trang', '0349459165', 'Ngõ 35 Phố Kim Mã Thượng', 'Thành phố Hà Nội', 1.000, 19780.00, NULL, NULL, NULL, '2025-09-28 12:06:11', 'CANCELED', 890000.00, 19780.00, 909780.00),
(6, 44, NULL, NULL, NULL, 5.42, 36260.00, 0.00, 926260.00, NULL, 'trang trang', '0123456789', 'Đường Số 19', 'Thành phố Hà Nội', 1.000, 36260.00, NULL, NULL, NULL, '2025-09-28 12:37:30', 'PENDING_PAYMENT', 890000.00, 36260.00, 926260.00),
(7, 44, NULL, NULL, NULL, 2.96, 18920.00, 0.00, 908920.00, NULL, 'Phùng thị trang', '0123456891', 'Ngách 2 Ngõ 72 Phố Dương Quảng Hàm', 'Thành phố Hà Nội', 1.000, 18920.00, NULL, NULL, NULL, '2025-09-28 13:02:13', 'DELIVERED', 890000.00, 18920.00, 908920.00),
(8, 44, NULL, NULL, NULL, 2.96, 18920.00, 0.00, 908920.00, NULL, 'Phùng thị trang', '0123456891', 'Ngách 2 Ngõ 72 Phố Dương Quảng Hàm', 'Thành phố Hà Nội', 1.000, 18920.00, NULL, NULL, NULL, '2025-09-28 13:02:13', 'PENDING_PAYMENT', 890000.00, 18920.00, 908920.00),
(9, 44, NULL, NULL, NULL, 6.67, 40010.00, 0.00, 930010.00, NULL, 'my', '01234568799', 'Phố An Dương', 'Thành phố Hà Nội', 1.000, 40010.00, NULL, NULL, NULL, '2025-09-28 13:04:51', 'DELIVERED', 890000.00, 40010.00, 930010.00),
(10, 44, NULL, NULL, NULL, 6.67, 40010.00, 0.00, 930010.00, NULL, 'my', '01234568799', 'Phố An Dương', 'Thành phố Hà Nội', 1.000, 40010.00, NULL, NULL, NULL, '2025-09-28 13:04:51', 'PENDING_PAYMENT', 890000.00, 40010.00, 930010.00),
(11, 44, NULL, NULL, NULL, 3.92, 20840.00, 0.00, 910840.00, NULL, 'trang trang', '0123456789', 'Ngõ Núi Trúc', 'Thành phố Hà Nội', 1.000, 20840.00, NULL, NULL, NULL, '2025-09-28 13:20:22', 'PAID', 890000.00, 20840.00, 910840.00),
(12, 44, NULL, NULL, NULL, 3.64, 20280.00, 0.00, 620280.00, NULL, 'trang trang', '0349459165', 'Phố Đội Cấn', 'Thành phố Hà Nội', 0.600, 20280.00, NULL, NULL, NULL, '2025-09-29 16:55:56', 'PENDING_PAYMENT', 600000.00, 20280.00, 620280.00),
(13, 44, NULL, NULL, NULL, 6.40, 39200.00, 0.00, 849200.00, NULL, 'phùng trang', '0349459165', 'Phố Nguyễn Trung Trực', 'Thành phố Hà Nội', 0.800, 39200.00, NULL, NULL, NULL, '2025-09-30 07:48:07', 'SHIPPED', 810000.00, 39200.00, 849200.00);

--
-- Triggers `orders`
--
DELIMITER $$
CREATE TRIGGER `orders_total_amount_sync` BEFORE INSERT ON `orders` FOR EACH ROW BEGIN
  IF NEW.total_amount IS NULL OR NEW.total_amount = 0 THEN
    SET NEW.total_amount = IFNULL(NEW.grand_total, 0);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `order_audits`
--

CREATE TABLE `order_audits` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `action` varchar(40) NOT NULL,
  `old_status` varchar(30) DEFAULT NULL,
  `new_status` varchar(30) DEFAULT NULL,
  `by_user_id` int(11) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_audits`
--

INSERT INTO `order_audits` (`id`, `order_id`, `action`, `old_status`, `new_status`, `by_user_id`, `note`, `created_at`) VALUES
(1, 11, 'STATUS_CHANGE', 'PAID', 'PAID', NULL, NULL, '2025-09-28 23:51:13'),
(2, 11, 'STATUS_CHANGE', 'PAID', 'PAID', NULL, NULL, '2025-09-28 23:51:17'),
(3, 2, 'STATUS_CHANGE', 'CANCELED', 'CANCELED', NULL, NULL, '2025-09-28 23:57:46'),
(4, 11, 'STATUS_CHANGE', 'PACKING', 'PACKING', NULL, NULL, '2025-09-29 05:05:40'),
(5, 11, 'STATUS_CHANGE', 'SHIPPED', 'SHIPPED', NULL, NULL, '2025-09-29 05:08:43'),
(6, 11, 'STATUS_CHANGE', 'SHIPPED', 'SHIPPED', NULL, NULL, '2025-09-29 05:08:47'),
(7, 11, 'STATUS_CHANGE', 'DELIVERED', 'DELIVERED', NULL, NULL, '2025-09-29 05:09:03'),
(8, 11, 'STATUS_CHANGE', 'DELIVERED', 'DELIVERED', NULL, NULL, '2025-09-29 05:09:08'),
(9, 9, 'STATUS_CHANGE', 'PACKING', 'PACKING', NULL, NULL, '2025-09-29 05:28:08'),
(10, 9, 'STATUS_CHANGE', 'SHIPPED', 'SHIPPED', NULL, NULL, '2025-09-29 05:28:22'),
(11, 9, 'STATUS_CHANGE', 'DELIVERED', 'DELIVERED', NULL, NULL, '2025-09-29 05:28:27'),
(12, 9, 'STATUS_CHANGE', 'DELIVERED', 'DELIVERED', NULL, NULL, '2025-09-29 05:28:33'),
(13, 3, 'STATUS_CHANGE', 'CANCELED', 'CANCELED', NULL, NULL, '2025-09-29 05:44:28'),
(14, 7, 'STATUS_CHANGE', 'PACKING', 'PACKING', NULL, NULL, '2025-09-29 09:40:11'),
(15, 7, 'STATUS_CHANGE', 'SHIPPED', 'SHIPPED', NULL, NULL, '2025-09-29 09:40:42'),
(16, 7, 'STATUS_CHANGE', 'DELIVERED', 'DELIVERED', NULL, NULL, '2025-09-29 09:40:56'),
(17, 13, 'STATUS_CHANGE', 'PACKING', 'PACKING', NULL, NULL, '2025-09-30 00:50:40'),
(18, 13, 'STATUS_CHANGE', 'PACKING', 'PACKING', NULL, NULL, '2025-09-30 00:50:43'),
(19, 13, 'STATUS_CHANGE', 'SHIPPED', 'SHIPPED', NULL, NULL, '2025-09-30 00:50:47');

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
  `price` decimal(10,2) DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `weight_kg_per_item` decimal(12,3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `unit_price`, `product_name`, `weight_kg_per_item`) VALUES
(1, 1, NULL, 2, 445000.00, 445000.00, NULL, NULL),
(2, 2, NULL, 1, 250000.00, 250000.00, NULL, NULL),
(3, 3, 4, 2, NULL, 200000.00, 'gấu bông noel', 0.300),
(4, 3, 6, 1, NULL, 130000.00, 'GẤU NÂU MỀM MẠI', 0.500),
(5, 4, 4, 2, NULL, 200000.00, 'gấu bông noel', 0.300),
(6, 4, 6, 1, NULL, 130000.00, 'GẤU NÂU MỀM MẠI', 0.500),
(7, 5, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(8, 5, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(9, 5, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(10, 5, 11, 2, NULL, 130000.00, 'GẤU TRÚC HAM ĂN', 0.200),
(11, 6, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(12, 6, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(13, 6, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(14, 6, 11, 2, NULL, 130000.00, 'GẤU TRÚC HAM ĂN', 0.200),
(15, 7, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(16, 8, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(17, 7, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(18, 8, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(19, 8, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(20, 7, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(21, 8, 11, 2, NULL, 130000.00, 'GẤU TRÚC HAM ĂN', 0.200),
(22, 7, 11, 2, NULL, 130000.00, 'GẤU TRÚC HAM ĂN', 0.200),
(23, 10, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(24, 9, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(25, 9, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(26, 10, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(27, 9, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(28, 10, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(29, 9, 11, 2, NULL, 130000.00, 'GẤU TRÚC HAM ĂN', 0.200),
(30, 10, 11, 2, NULL, 130000.00, 'GẤU TRÚC HAM ĂN', 0.200),
(31, 11, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(32, 11, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(33, 11, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200),
(34, 11, 11, 2, NULL, 130000.00, 'GẤU TRÚC HAM ĂN', 0.200),
(35, 12, 4, 3, NULL, 200000.00, 'gấu bông noel', 0.200),
(36, 13, 4, 3, NULL, 200000.00, 'gấu bông noel', 0.200),
(37, 13, 12, 1, NULL, 210000.00, 'GẤU DÂU ĐÁNG YÊU', 0.200);

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
-- Table structure for table `password_reset_codes`
--

CREATE TABLE `password_reset_codes` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `code` varchar(6) NOT NULL,
  `created_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` bit(1) NOT NULL DEFAULT b'0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_reset_codes`
--

INSERT INTO `password_reset_codes` (`id`, `email`, `code`, `created_at`, `expires_at`, `used`) VALUES
(16, 'hoahoavuive2004@gmail.com', '530154', '2025-09-23 14:45:53', '2025-09-23 14:50:53', b'1'),
(17, 'phungtrang19012004@gmail.com', '837343', '2025-09-24 13:25:11', '2025-09-24 13:30:11', b'1');

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
(12, 'manage_categories', 'Quản lý danh mục sản phẩm'),
(13, 'manage_products', 'Quản lý sản phẩm (thêm/sửa/xoá)'),
(14, 'manage_brands', 'Quản lý thương hiệu'),
(15, 'manage_imports', 'Quản lý phiếu nhập'),
(16, 'manage_suppliers', 'Quản lý nhà cung cấp'),
(17, 'manage_orders', 'Quản lý đơn hàng'),
(18, 'manage_livechat', 'Quản lý và trả lời live chat'),
(19, 'manage_coupons', 'Quản lý phiếu giảm giá'),
(20, 'manage_shippingvoucher', 'Quản lý phiếu vận chuyển'),
(21, 'manage_customer', 'Quản lý khách hàng'),
(22, 'view_reports', 'Xem báo cáo'),
(23, 'manage_users', 'Quản lý nhóm người dùng'),
(24, 'manage_permission', 'Quản lý phân quyền chức năng'),
(25, 'manage_shippingrate', 'Quản lý biểu phí vận chuyển (thêm/sửa/xoá)');

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
(14, 'TIỂU ĐÀO ĐÀO', 'HHH', 120000.00, '/uploads/1756280863080-210403397-OIP (6).webp', 2, 3, 22, '2025-08-27 07:47:43');

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
(14, 6, 'Tặng quà');

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
(1, 'CUSTOMER', 'Khách hàng thông thường'),
(2, 'MEOMEO', 'Nhà bán hàng quản lý sản phẩm'),
(3, 'ADMIN', 'Quản trị viên toàn quyền'),
(4, 'MANAGER', 'Quản lý'),
(5, 'DEPTRAI', 'đẹp trai');

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
(2, 12, 76),
(2, 13, 77),
(2, 14, 78),
(3, 12, 41),
(3, 13, 48),
(3, 14, 40),
(3, 15, 44),
(3, 16, 50),
(3, 17, 46),
(3, 18, 45),
(3, 19, 42),
(3, 20, 49),
(3, 21, 43),
(3, 22, 52),
(3, 23, 51),
(3, 24, 47),
(3, 25, 75);

-- --------------------------------------------------------

--
-- Table structure for table `shipping`
--

CREATE TABLE `shipping` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `address_id` int(11) DEFAULT NULL,
  `carrier_id` int(11) DEFAULT NULL,
  `service_code` varchar(50) DEFAULT NULL,
  `fee` decimal(12,2) DEFAULT NULL,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `status` varchar(30) DEFAULT 'created',
  `eta_days_min` int(11) DEFAULT NULL,
  `eta_days_max` int(11) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `shipping_method` varchar(100) DEFAULT NULL,
  `tracking_number` varchar(50) DEFAULT NULL,
  `shipped_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipping`
--

INSERT INTO `shipping` (`id`, `order_id`, `address_id`, `carrier_id`, `service_code`, `fee`, `distance_km`, `status`, `eta_days_min`, `eta_days_max`, `address`, `shipping_method`, `tracking_number`, `shipped_date`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, 'created', NULL, NULL, '123 Đường Láng, Hà Nội', 'GHTK', 'GH12345', '2025-08-25 14:50:57'),
(2, 2, NULL, NULL, NULL, NULL, NULL, 'created', NULL, NULL, '123 Đường Láng, Hà Nội', 'Viettel Post', 'VT67890', '2025-08-25 14:50:57');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_carriers`
--

CREATE TABLE `shipping_carriers` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(120) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipping_carriers`
--

INSERT INTO `shipping_carriers` (`id`, `code`, `name`, `is_active`, `created_at`) VALUES
(1, 'INTERNAL', 'Giao nội bộ', 1, '2025-09-22 03:20:53'),
(2, 'GHT', 'Giao hỏa tốc', 1, '2025-09-27 17:07:13'),
(3, 'PTT', 'PHÙNG THỊ TRANG', 1, '2025-09-28 06:00:56');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_quotes`
--

CREATE TABLE `shipping_quotes` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `cart_hash` varchar(64) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `address_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `distance_km` decimal(8,2) NOT NULL,
  `fee_before_voucher` decimal(12,2) NOT NULL,
  `fee_after_voucher` decimal(12,2) NOT NULL,
  `eta_days_min` int(11) DEFAULT NULL,
  `eta_days_max` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `details_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipping_records`
--

CREATE TABLE `shipping_records` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `carrier` varchar(100) DEFAULT NULL,
  `tracking_code` varchar(50) DEFAULT NULL,
  `fee_charged` decimal(12,2) DEFAULT NULL,
  `status` enum('CREATED','PICKED','IN_TRANSIT','DELIVERED','FAILED') NOT NULL DEFAULT 'CREATED',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipping_records`
--

INSERT INTO `shipping_records` (`id`, `order_id`, `carrier`, `tracking_code`, `fee_charged`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 'INTERNAL', NULL, 17880.00, 'CREATED', '2025-09-27 22:39:27', '2025-09-27 22:39:27'),
(2, 4, 'INTERNAL', NULL, 17880.00, 'CREATED', '2025-09-27 22:44:30', '2025-09-27 22:44:30'),
(3, 5, 'INTERNAL', NULL, 19780.00, 'CREATED', '2025-09-28 05:06:11', '2025-09-28 05:06:11'),
(4, 6, 'INTERNAL', NULL, 36260.00, 'CREATED', '2025-09-28 05:37:30', '2025-09-28 05:37:30'),
(5, 8, 'INTERNAL', NULL, 18920.00, 'CREATED', '2025-09-28 06:02:13', '2025-09-28 06:02:13'),
(6, 7, 'INTERNAL', NULL, 18920.00, 'CREATED', '2025-09-28 06:02:13', '2025-09-28 06:02:13'),
(7, 9, 'INTERNAL', NULL, 40010.00, 'CREATED', '2025-09-28 06:04:51', '2025-09-28 06:04:51'),
(8, 10, 'INTERNAL', NULL, 40010.00, 'CREATED', '2025-09-28 06:04:51', '2025-09-28 06:04:51'),
(9, 11, 'INTERNAL', NULL, 20840.00, 'CREATED', '2025-09-28 06:20:22', '2025-09-28 06:20:22'),
(10, 12, 'INTERNAL', NULL, 20280.00, 'CREATED', '2025-09-29 09:55:56', '2025-09-29 09:55:56'),
(11, 13, 'INTERNAL', NULL, 39200.00, 'CREATED', '2025-09-30 00:48:07', '2025-09-30 00:48:07');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_services`
--

CREATE TABLE `shipping_services` (
  `id` int(11) NOT NULL,
  `carrier_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `label` varchar(120) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `base_days_min` int(11) DEFAULT 2,
  `base_days_max` int(11) DEFAULT 4
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipping_services`
--

INSERT INTO `shipping_services` (`id`, `carrier_id`, `code`, `label`, `is_active`, `base_days_min`, `base_days_max`) VALUES
(1, 1, 'STD', 'Tiêu chuẩn (2–4 ngày)', 1, 2, 4),
(2, 2, 'GHT0111', 'giao siêu nhanh', 1, 1, 2),
(3, 3, 'WWW', 'WEWEWE', 1, 1, 2);

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
-- Table structure for table `themes`
--

CREATE TABLE `themes` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(140) NOT NULL,
  `description` text DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `themes`
--

INSERT INTO `themes` (`id`, `name`, `slug`, `description`, `is_featured`, `display_order`, `active`, `created_at`, `updated_at`) VALUES
(1, 'Noel ấm áp', 'noel-am-ap', 'BST gấu bông & quà tặng mùa lễ hội', 1, 10, 1, '2025-09-29 17:37:07', '2025-09-29 17:37:07'),
(2, 'Back to School', 'back-to-school', 'Đồ ôm mềm xả stress mùa tựu trường', 1, 20, 1, '2025-09-29 17:37:07', '2025-09-29 17:37:07'),
(3, 'Valentine ngọt ngào', 'valentine-ngot-ngao', 'Quà yêu thương cho người ấy', 1, 30, 1, '2025-09-29 17:37:07', '2025-09-29 17:37:07');

-- --------------------------------------------------------

--
-- Table structure for table `theme_categories`
--

CREATE TABLE `theme_categories` (
  `theme_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `theme_categories`
--

INSERT INTO `theme_categories` (`theme_id`, `category_id`, `created_at`) VALUES
(1, 1, '2025-09-29 17:37:07'),
(1, 2, '2025-09-29 17:37:07'),
(2, 2, '2025-09-29 17:37:07'),
(2, 4, '2025-09-29 17:37:07'),
(3, 1, '2025-09-29 17:37:07'),
(3, 5, '2025-09-29 17:37:07');

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
  `status` enum('ACTIVE','INACTIVE','BANNED') NOT NULL DEFAULT 'ACTIVE',
  `tier` enum('DONG','BAC','VANG','BACHKIM','KIMCUONG') NOT NULL DEFAULT 'DONG',
  `points` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `address`, `phone`, `status`, `tier`, `points`, `created_at`) VALUES
(1, 'khachhang1', 'hashed_pass1', 'khachhang1@example.com', '123 Đường Láng, Hà Nội', '0901234567', 'ACTIVE', 'DONG', 0, '2025-08-25 14:50:57'),
(2, 'seller1', 'hashed_pass2', 'seller1@example.com', '456 Nguyễn Huệ, TP.HCM', '0912345678', 'ACTIVE', 'DONG', 0, '2025-08-25 14:50:57'),
(3, 'admin1', 'hashed_pass3', 'admin1@example.com', '789 Lê Lợi, Đà Nẵng', '0923456789', 'ACTIVE', 'DONG', 0, '2025-08-25 14:50:57'),
(4, 'trangtrang', '$2a$10$DFCziBSUoL7PH/BQHfTLfOB2XclxCOKufsr8X/Yt71MFyWgbz9A2i', 'phungtrang19012004@gmail.com', 'fffffff', '0349459165', 'ACTIVE', 'DONG', 0, '2025-08-26 03:52:55'),
(8, 'geoserver', '1', 'pwea@gmail.com', 'ss', '0368498289', 'ACTIVE', 'DONG', 0, '2025-08-26 05:16:11'),
(26, 'customer', '1', 'customer@test', 'hanoi', '0349459165', 'ACTIVE', 'DONG', 0, '2025-08-26 14:19:39'),
(27, 'admin', '1', 'admin@test', 'hanoi', '03', 'ACTIVE', 'DONG', 0, '2025-08-26 14:20:23'),
(29, 'trang', '123', 'trang@gmail.com', NULL, NULL, 'ACTIVE', 'DONG', 0, '2025-09-10 12:34:00'),
(30, 'Nguyen Van A', '$2a$10$jg4lUFNGWYbrqETGuMhBuusX.KdbfQIbmcgNjoI8vT/EYXHxBvh/.', 'abc@gmail.com', 'nam dinh', '0349459165', 'ACTIVE', 'DONG', 0, '2025-09-10 14:24:35'),
(31, 'tien dat', '$2a$10$Jbw9XjQiRYzNa7TVbdihyuO59SBI56UgGTNbYJinZ37g.93UXIT.i', 'a@gmail.com', NULL, NULL, 'ACTIVE', 'DONG', 0, '2025-09-10 14:58:31'),
(32, 'Nguyen Van A', '$2a$10$grUUt5EDoYTpU0AZ4i6GjO9tn8vbxI3oBBauviwknkouOWt24uyvG', 'aaa@gmail.com', NULL, NULL, 'ACTIVE', 'DONG', 0, '2025-09-10 15:16:34'),
(33, 'khachhang_test', '$2a$10$gy1jz2u5ZuXWC14tB4B1i.8kvTEt.LMKV8LjQTMgMZjGS7IXXsR32', 'khachhang_test@example.com', '123 Hà Nội', '0909999999', 'ACTIVE', 'DONG', 0, '2025-09-11 01:47:29'),
(35, 'tiendat', '$2a$10$Hh05Mbc2C/i5cgwqKUhZ5OpjpUa9/m6nTv111/YMxhNXwpzBck55C', 'atest@example.com', NULL, NULL, 'ACTIVE', 'DONG', 0, '2025-09-11 14:19:56'),
(36, 'tiendatngu', '$2a$10$iqs9cMI36IfRmgr9l/PjvORx.1v919EsLp5yYKyqAyqENxKVgCO8u', 'tiendat9012004@gmail.com', 'ha noi', '0349459165', 'ACTIVE', 'DONG', 0, '2025-09-11 14:29:02'),
(37, 'tiendatngu', '$2a$10$tOmpK/6WzSSG3Iya/O1H2epxi.Dmy1i3IuU.BO7YTNP7nFtfoQZq2', 'trang19012004@gmail.com', 'fffffff', '0349459165', 'ACTIVE', 'DONG', 0, '2025-09-11 16:54:02'),
(38, 'hoa@gmail.com', '$2a$10$0Ssx7WTwykYH7cDxUQupfeeWav4wmVlgHcj5PnZvIu8kC/GVLb89y', 'hoahoavuive2004@gmail.com', NULL, '0349459165', 'ACTIVE', 'DONG', 0, '2025-09-19 22:41:38'),
(39, 'dat9012004@gmail.com', '$2a$10$ZfphGHZPRSN73iMqdMpvpOuIpWiYeavmWy/ZLTlorGkuANPDMvNAG', 'mai@gmail.com', NULL, '0349459165', 'ACTIVE', 'DONG', 0, '2025-09-20 03:47:34'),
(41, 'combongu', '$2a$10$1WRmds2qFnZhqcxjwtPUwutwisLh0XJZx979bbDIRH.BMMS9QvIvq', 'nhamnhi@gmail.com', NULL, '0978467297', 'ACTIVE', 'DONG', 0, '2025-09-20 03:58:37'),
(42, 'hello', '$2a$10$VCWI6ghVP/H0SY.K3B6oouLwZPDkMOfAooDyQMDgIg5xlcMeeKCk.', 'doconlon@gmail.com', NULL, '0349459165', 'ACTIVE', 'DONG', 0, '2025-09-20 03:59:52'),
(43, 'anhhamc', '$2a$10$w8hm/Kprp.Ky6Ikq0k53xOUTECtxHLZUvtoAkyzs2cK50NxXYM.ki', 'anhha19052004@gmail.com', 'Đông Dương Nam Sơn Tp.Bắc Ninh', '0366379629', 'ACTIVE', 'DONG', 0, '2025-09-22 10:55:37'),
(44, 'phùng thị trang', '$2a$10$LSXXFOlRdgQBtFNDE2aU3ukNeQ3oIAo2JORUfRNHTOjMp3HL203ea', 'khachhang@gmail.com', 'dadada', '0349459165', 'ACTIVE', 'DONG', 0, '2025-09-26 07:56:46'),
(45, 'nhom 13', '$2a$10$JXL7YLq5D7j2qZGW3kdviOpJ88jOwNPX8r6HRvYyM1NsjHtkcez/.', 'test@gmail.com', 'dadada', '0349459165', 'ACTIVE', 'DONG', 0, '2025-09-28 00:21:50');

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `label` varchar(60) DEFAULT NULL,
  `receiver_name` varchar(120) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `province_code` varchar(10) NOT NULL,
  `district_code` varchar(10) NOT NULL,
  `ward_code` varchar(10) NOT NULL,
  `address_line` varchar(255) NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(13, 4, 3),
(2, 37, 3),
(9, 38, 1),
(8, 39, 3),
(10, 41, 2),
(12, 42, 1),
(14, 43, 3),
(15, 44, 1),
(16, 45, 1);

-- --------------------------------------------------------

--
-- Table structure for table `vn_districts`
--

CREATE TABLE `vn_districts` (
  `code` varchar(10) NOT NULL,
  `province_code` varchar(10) NOT NULL,
  `name` varchar(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vn_provinces`
--

CREATE TABLE `vn_provinces` (
  `code` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vn_wards`
--

CREATE TABLE `vn_wards` (
  `code` varchar(10) NOT NULL,
  `district_code` varchar(10) NOT NULL,
  `name` varchar(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_theme_products`
-- (See below for the actual view)
--
CREATE TABLE `v_theme_products` (
`theme_id` int(11)
,`theme_name` varchar(120)
,`category_id` int(11)
,`category_name` varchar(100)
,`product_id` int(11)
,`product_name` varchar(255)
,`price` decimal(10,2)
,`image_url` varchar(255)
,`brand_id` int(11)
,`product_created_at` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `address_line` varchar(255) NOT NULL,
  `province_code` varchar(10) NOT NULL,
  `district_code` varchar(10) NOT NULL,
  `ward_code` varchar(10) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `warehouses`
--

INSERT INTO `warehouses` (`id`, `name`, `address_line`, `province_code`, `district_code`, `ward_code`, `latitude`, `longitude`, `is_active`, `created_at`) VALUES
(1, 'Cửa hàng chính', '123 Trần Duy Hưng', '01', '001', '00001', 21.0075000, 105.7980000, 1, '2025-09-22 03:20:53');

-- --------------------------------------------------------

--
-- Structure for view `v_theme_products`
--
DROP TABLE IF EXISTS `v_theme_products`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_theme_products`  AS SELECT `t`.`id` AS `theme_id`, `t`.`name` AS `theme_name`, `c`.`id` AS `category_id`, `c`.`name` AS `category_name`, `p`.`id` AS `product_id`, `p`.`name` AS `product_name`, `p`.`price` AS `price`, `p`.`image_url` AS `image_url`, `p`.`brand_id` AS `brand_id`, `p`.`created_at` AS `product_created_at` FROM (((`themes` `t` join `theme_categories` `tc` on(`tc`.`theme_id` = `t`.`id`)) join `categories` `c` on(`c`.`id` = `tc`.`category_id`)) left join `products` `p` on(`p`.`category_id` = `c`.`id`)) WHERE `t`.`active` = 1 ;

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
-- Indexes for table `carrier_rate_rules`
--
ALTER TABLE `carrier_rate_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_crr_service` (`service_id`),
  ADD KEY `idx_rate_range` (`min_km`,`max_km`),
  ADD KEY `idx_rate_active` (`is_active`,`active_from`,`active_to`);

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
-- Indexes for table `distance_cache`
--
ALTER TABLE `distance_cache`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_pair` (`from_lat`,`from_lng`,`to_lat`,`to_lng`),
  ADD KEY `idx_cached` (`cached_at`);

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
  ADD KEY `idx_order_status` (`status`),
  ADD KEY `idx_orders_ship_addr` (`shipping_address_id`),
  ADD KEY `idx_orders_ship_srv` (`shipping_service_id`),
  ADD KEY `idx_orders_ship_car` (`shipping_carrier_id`),
  ADD KEY `idx_orders_user_status_date` (`user_id`,`status`,`order_date`),
  ADD KEY `idx_orders_status_date` (`status`,`order_date`),
  ADD KEY `idx_orders_province` (`province`),
  ADD KEY `idx_orders_carrier` (`shipping_carrier_id`);

--
-- Indexes for table `order_audits`
--
ALTER TABLE `order_audits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_audits_order` (`order_id`);

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
-- Indexes for table `password_reset_codes`
--
ALTER TABLE `password_reset_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prc_email` (`email`),
  ADD KEY `idx_prc_email_code` (`email`,`code`);

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
  ADD KEY `order_id` (`order_id`),
  ADD KEY `idx_shipping_status` (`status`),
  ADD KEY `fk_shipping_addr` (`address_id`),
  ADD KEY `fk_shipping_car` (`carrier_id`);

--
-- Indexes for table `shipping_carriers`
--
ALTER TABLE `shipping_carriers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `shipping_quotes`
--
ALTER TABLE `shipping_quotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_quote_user` (`user_id`,`cart_hash`),
  ADD KEY `idx_quote_exp` (`expires_at`),
  ADD KEY `fk_sq_wh` (`warehouse_id`),
  ADD KEY `fk_sq_addr` (`address_id`),
  ADD KEY `fk_sq_srv` (`service_id`);

--
-- Indexes for table `shipping_records`
--
ALTER TABLE `shipping_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_shipping_order` (`order_id`),
  ADD KEY `idx_shipping_status` (`status`);

--
-- Indexes for table `shipping_services`
--
ALTER TABLE `shipping_services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_carrier_service` (`carrier_id`,`code`);

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
-- Indexes for table `themes`
--
ALTER TABLE `themes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_themes_slug` (`slug`);

--
-- Indexes for table `theme_categories`
--
ALTER TABLE `theme_categories`
  ADD PRIMARY KEY (`theme_id`,`category_id`),
  ADD KEY `idx_theme_categories_category` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD KEY `idx_users_username` (`username`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_status` (`status`),
  ADD KEY `idx_users_tier` (`tier`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ua_user` (`user_id`,`is_default`),
  ADD KEY `idx_ua_geo` (`latitude`,`longitude`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_roles_user_role` (`user_id`,`role_id`),
  ADD UNIQUE KEY `uq_user_roles_user` (`user_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `vn_districts`
--
ALTER TABLE `vn_districts`
  ADD PRIMARY KEY (`code`),
  ADD KEY `idx_vnd_prov` (`province_code`);

--
-- Indexes for table `vn_provinces`
--
ALTER TABLE `vn_provinces`
  ADD PRIMARY KEY (`code`);

--
-- Indexes for table `vn_wards`
--
ALTER TABLE `vn_wards`
  ADD PRIMARY KEY (`code`),
  ADD KEY `idx_vnw_dist` (`district_code`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_wh_active` (`is_active`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `carrier_rate_rules`
--
ALTER TABLE `carrier_rate_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `distance_cache`
--
ALTER TABLE `distance_cache`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `order_audits`
--
ALTER TABLE `order_audits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `password_reset_codes`
--
ALTER TABLE `password_reset_codes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `shipping`
--
ALTER TABLE `shipping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shipping_carriers`
--
ALTER TABLE `shipping_carriers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `shipping_quotes`
--
ALTER TABLE `shipping_quotes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shipping_records`
--
ALTER TABLE `shipping_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `shipping_services`
--
ALTER TABLE `shipping_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
-- AUTO_INCREMENT for table `themes`
--
ALTER TABLE `themes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carrier_rate_rules`
--
ALTER TABLE `carrier_rate_rules`
  ADD CONSTRAINT `fk_crr_service` FOREIGN KEY (`service_id`) REFERENCES `shipping_services` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_orders_ship_addr` FOREIGN KEY (`shipping_address_id`) REFERENCES `user_addresses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orders_ship_car` FOREIGN KEY (`shipping_carrier_id`) REFERENCES `shipping_carriers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orders_ship_srv` FOREIGN KEY (`shipping_service_id`) REFERENCES `shipping_services` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_audits`
--
ALTER TABLE `order_audits`
  ADD CONSTRAINT `fk_oa_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_shipping_addr` FOREIGN KEY (`address_id`) REFERENCES `user_addresses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_shipping_car` FOREIGN KEY (`carrier_id`) REFERENCES `shipping_carriers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `shipping_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipping_quotes`
--
ALTER TABLE `shipping_quotes`
  ADD CONSTRAINT `fk_sq_addr` FOREIGN KEY (`address_id`) REFERENCES `user_addresses` (`id`),
  ADD CONSTRAINT `fk_sq_srv` FOREIGN KEY (`service_id`) REFERENCES `shipping_services` (`id`),
  ADD CONSTRAINT `fk_sq_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sq_wh` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`);

--
-- Constraints for table `shipping_records`
--
ALTER TABLE `shipping_records`
  ADD CONSTRAINT `fk_sr_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipping_services`
--
ALTER TABLE `shipping_services`
  ADD CONSTRAINT `fk_ss_carrier` FOREIGN KEY (`carrier_id`) REFERENCES `shipping_carriers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipping_voucher_uses`
--
ALTER TABLE `shipping_voucher_uses`
  ADD CONSTRAINT `fk_svu_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_svu_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `shipping_vouchers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `theme_categories`
--
ALTER TABLE `theme_categories`
  ADD CONSTRAINT `fk_tc_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tc_theme` FOREIGN KEY (`theme_id`) REFERENCES `themes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `fk_ua_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vn_districts`
--
ALTER TABLE `vn_districts`
  ADD CONSTRAINT `fk_vnd_prov` FOREIGN KEY (`province_code`) REFERENCES `vn_provinces` (`code`) ON DELETE CASCADE;

--
-- Constraints for table `vn_wards`
--
ALTER TABLE `vn_wards`
  ADD CONSTRAINT `fk_vnw_dist` FOREIGN KEY (`district_code`) REFERENCES `vn_districts` (`code`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
