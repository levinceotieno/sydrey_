-- MySQL dump 10.13  Distrib 8.0.41, for Linux (aarch64)
--
-- Host: localhost    Database: SydreysEnterprise
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.24.10.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `author` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES (5,'The Health Benefits of Ginger and Turmeric','<p><span style=\"font-family: \'times new roman\', times, serif;\"><strong>Nature\'s Powerful Healers</strong></span></p>\r\n<p><span style=\"font-family: \'times new roman\', times, serif;\"><strong><img src=\"../uploads/blog-images/blog-1741014351588-95177510.webp\" alt=\"Ginger\" width=\"150\" height=\"75\"></strong></span></p>\r\n<ul>\r\n<li><span style=\"font-family: \'times new roman\', times, serif; font-size: 10pt;\">Introduction to ginger and turmeric as traditional medicinal plants.</span></li>\r\n<li><span style=\"font-family: \'times new roman\', times, serif; font-size: 10pt;\">The science behind turmeric\'s anti-inflammatory properties and curcumin.</span></li>\r\n<li><span style=\"font-family: \'times new roman\', times, serif; font-size: 10pt;\">Ginger\'s benefits for digestive health and immune system support.</span></li>\r\n<li><span style=\"font-family: \'times new roman\', times, serif; font-size: 10pt;\">How to incorporate both into your daily diet with simple recipes.</span></li>\r\n<li><span style=\"font-family: \'times new roman\', times, serif; font-size: 10pt;\">Tips for growing your own ginger and turmeric at home.</span></li>\r\n<li><span style=\"font-family: \'times new roman\', times, serif; font-size: 10pt;\">Sustainable farming practices used at Sydrey Enterprise.</span></li>\r\n<li><span style=\"font-family: \'times new roman\', times, serif; font-size: 10pt;\">Featured products from our store that showcase these ingredients</span></li>\r\n</ul>',NULL,'Admin','2025-03-03 15:06:32','2025-03-03 15:06:32'),(6,'Maximizing Your Farm\'s Potential','<p><span style=\"color: rgb(241, 196, 15); font-size: 8pt; font-family: \'times new roman\', times, serif;\"><strong>Insights from Our Agronomist Consultations</strong></span></p>\r\n<p><span style=\"font-size: 10pt; font-family: \'times new roman\', times, serif;\">Common challenges faced by small-scale farmers in Kenya.</span></p>\r\n<p><span style=\"font-size: 10pt; font-family: \'times new roman\', times, serif;\">How professional agronomist consultations can increase crop yields.</span></p>\r\n<p><span style=\"font-size: 10pt; font-family: \'times new roman\', times, serif;\">Success story: A local farmer who transformed their production after our consultation service Key soil management techniques for different agricultural zones</span></p>\r\n<p><span style=\"font-size: 10pt; font-family: \'times new roman\', times, serif;\">&nbsp;Understanding plant diseases and sustainable prevention methods.</span></p>\r\n<p><span style=\"font-size: 10pt; font-family: \'times new roman\', times, serif;\">The importance of selecting the right seeds for your specific climate and soil.</span></p>\r\n<p><span style=\"font-size: 10pt; font-family: \'times new roman\', times, serif;\">How our Agricultural Education services</span></p>',NULL,'Admin','2025-03-03 15:41:17','2025-03-03 15:41:17');
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `service` enum('education','agronomist') NOT NULL,
  `status` enum('pending','confirmed','completed') DEFAULT 'pending',
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (2,4,'agronomist','pending','2025-03-21','11:00:00','2025-03-02 06:51:13');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (24,3,3,1,'2025-02-22 05:55:06'),(25,4,1,1,'2025-03-02 12:13:45');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_products`
--

DROP TABLE IF EXISTS `order_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_products`
--

LOCK TABLES `order_products` WRITE;
/*!40000 ALTER TABLE `order_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `delivery_address` varchar(255) NOT NULL,
  `delivery_location` enum('withinKenya','outsideKenya') NOT NULL,
  `quantity` int NOT NULL,
  `status` enum('pending','processing','shipped','delivered') DEFAULT 'pending',
  `total_price` decimal(10,2) NOT NULL,
  `delivery_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,1,'Ngong','withinKenya',2,'shipped',4800.00,'2025-02-12','2025-02-09 08:38:05'),(4,4,3,'Holland ','outsideKenya',9,'pending',1800.00,'2025-02-28','2025-02-21 09:21:09');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `quantity` varchar(50) NOT NULL,
  `category` enum('wholesale','retail') NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (4,'Fresh Organic Ginger Root','Premium quality organic ginger root, freshly harvested from our sustainable farms.',150.00,'500 kg','retail','/uploads/1741005841549.webp','2025-03-03 12:44:01','2025-03-03 12:44:01'),(5,'Dried Ginger Powder','Finely ground dried ginger, perfect for cooking, baking, and herbal teas.',180.00,'300 packets','retail','/uploads/1741005975437.jpg','2025-03-03 12:46:15','2025-03-03 12:46:15'),(6,'Bulk Ginger Rhizomes','High-yield ginger rhizomes for commercial farming, sourced from our best-performing varieties.',12000.00,'2000 kg','wholesale','/uploads/1741006523315.jpg','2025-03-03 12:47:51','2025-03-03 12:55:23'),(7,'Fresh Turmeric Root','Vibrant yellow turmeric roots with high curcumin content, great for health and culinary uses.',200.00,'350 kg','retail','/uploads/1741006146083.jpg','2025-03-03 12:49:06','2025-03-03 12:49:06'),(8,'Organic Turmeric Powder','100% pure turmeric powder with no additives, packed with antioxidants and anti-inflammatory benefits.',220.00,'450 packets','retail','/uploads/1741006229274.jpg','2025-03-03 12:50:29','2025-03-03 12:50:29'),(9,'Commercial Turmeric Seedlings','Disease-resistant turmeric seedlings with excellent growth rate, ideal for commercial cultivation.',15000.00,'5000 seedlings','wholesale','/uploads/1741006318499.jpg','2025-03-03 12:51:58','2025-03-03 12:51:58'),(10,'Fresh Garlic Bulbs','Premium large garlic bulbs with intense flavor, perfect for cooking and preserving.',250.00,'400 kg','retail','/uploads/1741006387024.png','2025-03-03 12:53:07','2025-03-03 12:53:07'),(11,'Dehydrated Garlic Flakes','Convenient dehydrated garlic flakes that retain all the flavor and nutritional benefits of fresh garlic.',190.00,'250 packets','retail','/uploads/1741006481970.jpg','2025-03-03 12:54:41','2025-03-03 12:54:41'),(12,'Bulk Garlic Seeds','High-quality garlic seeds for commercial planting, known for high yield and disease resistance.',18000.00,'1500 kg','wholesale','/uploads/1741006644519.jpg','2025-03-03 12:57:24','2025-03-03 12:57:24'),(13,'Heirloom Garlic Seed Collection','Collection of 10 different heirloom garlic seeds, perfect for home gardeners.',850.00,'200 collections','retail','/uploads/1741007408039.jpg','2025-03-03 13:10:08','2025-03-03 13:10:08'),(14,'Organic Turmeric Seed kit','Complete kit with 6 different culinary tumeric seeds, soil discs, and biodegradable pots.',1200.00,'150 kits','retail','/uploads/1741007560030.jpg','2025-03-03 13:12:40','2025-03-03 13:12:40'),(15,'Commercial Ginger Hybrid Seeds','Drought-resistant hybrid ginger seeds with improved yield potential, suitable for various Kenyan climates.',25000.00,'500 kg','wholesale','/uploads/1741007642370.jpg','2025-03-03 13:14:02','2025-03-03 13:14:02');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('cKJ19-Wrj7zdB1igU_eDr3WtSdx8ONHm',1741091296,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-03-04T10:23:51.926Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":1,\"name\":\"Admin\",\"role\":\"admin\",\"isAdmin\":1,\"profile_photo\":\"/images/default-profile.png\",\"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQwOTk3NDMxLCJleHAiOjE3NDEwODM4MzF9.aeB47cYYuvm3CDUXKKO1iMt9ZJ1FeZUV01eT6GcDJAA\"}}'),('mVN5YO8aAbR62GTpINX1pxs-0t9FO8hX',1741102914,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-03-04T12:36:04.973Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":1,\"name\":\"Admin\",\"role\":\"admin\",\"isAdmin\":1,\"profile_photo\":\"/images/default-profile.png\",\"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQxMDA1MzY0LCJleHAiOjE3NDEwOTE3NjR9.GUWcucdgZ9rMlFCNTxntComWYgzGxSjyMwS2r6mlBAE\"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` enum('customer','farmer','admin') DEFAULT 'customer',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@gmail.com','$2a$10$rU17V2Jopt7s1f1VfVcmzugy2LQU3XMptmxbNM/SViIdhJunGO9Q6','0767689532','/images/default-profile.png',1,'2025-02-06 11:19:39','admin'),(2,'Jarred Onditi','jared@gmail.com','$2a$10$5iX4Aii4yx5LR0Os0kDsceDH2/RlU8IYaxse6JY2DkoRbjLEEF5ty','0767689538','/uploads/3870b5a7f55964205627b9e6d261adbe',0,'2025-02-09 12:17:41','customer'),(3,'Test Drive','test@gmail.com','$2a$10$HZcYhQTe3G8pglapZJFsPOda6A8eydQaZD1YG2DADEzEBQbIUPghu','0767689538','/uploads/945d34cfa1af805e2b11346e111f2664',0,'2025-02-20 12:19:51','customer'),(4,'Benjamin Frank','benja@gmail.com','$2a$10$6CNLBRbYEprPsOySGoNBIuR/zQizYlrtO840MqljHfjN.p5KBosCK','0767689532','/images/default-profile.png',0,'2025-02-20 13:37:07','customer'),(5,'James','james@gmail.com','$2a$10$qFtdNkj71p9NBDfEJ61qxeNLcByNuvdULsNqkNnyU7BLhDjjGr0N6','0768889538','/images/default-profile.png',0,'2025-02-20 14:55:05','customer');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-04  4:13:07
