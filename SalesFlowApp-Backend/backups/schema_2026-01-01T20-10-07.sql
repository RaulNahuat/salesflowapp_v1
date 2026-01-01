-- ========================================
-- BACKUP DE ESTRUCTURA - SalesFlowApp
-- Fecha: 2026-01-01T20:10:10.024Z
-- Base de datos: defaultdb
-- ========================================

-- ========================================
-- Tabla: Businesses
-- ========================================

DROP TABLE IF EXISTS `Businesses`;

CREATE TABLE "Businesses" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL,
  "logoURL" varchar(255) DEFAULT NULL,
  "phone" varchar(255) DEFAULT NULL,
  "email" varchar(255) DEFAULT NULL,
  "address" text,
  "returnPolicy" text,
  "weekStartDay" int DEFAULT '1',
  "liveDays" json DEFAULT NULL,
  "settings" json DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "slug" ("slug")
);

-- ========================================
-- Tabla: Users
-- ========================================

DROP TABLE IF EXISTS `Users`;

CREATE TABLE "Users" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "firstName" varchar(255) DEFAULT NULL,
  "lastName" varchar(255) DEFAULT NULL,
  "email" varchar(255) DEFAULT NULL,
  "phone" varchar(255) NOT NULL,
  "password" varchar(255) DEFAULT NULL,
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "phone" ("phone"),
  UNIQUE KEY "email" ("email")
);

-- ========================================
-- Tabla: businesses
-- ========================================

DROP TABLE IF EXISTS `businesses`;

CREATE TABLE "businesses" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL,
  "logoURL" varchar(255) DEFAULT NULL,
  "settings" json DEFAULT NULL,
  "phone" varchar(255) DEFAULT NULL,
  "email" varchar(255) DEFAULT NULL,
  "address" text,
  "returnPolicy" text,
  "weekStartDay" int DEFAULT '1',
  "liveDays" json DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "slug" ("slug")
);

-- ========================================
-- Tabla: businessmembers
-- ========================================

DROP TABLE IF EXISTS `businessmembers`;

CREATE TABLE "businessmembers" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "role" enum('owner','employee','customer') DEFAULT 'customer',
  "accessToken" varchar(255) DEFAULT NULL,
  "localAlias" varchar(255) DEFAULT NULL,
  "BusinessId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "UserId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "permissions" json DEFAULT NULL,
  "status" enum('active','inactive') DEFAULT 'active',
  "deletedAt" datetime DEFAULT NULL,
  "createdAt" datetime DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "accessToken" ("accessToken"),
  UNIQUE KEY "localAlias" ("localAlias"),
  KEY "fk_bm_business" ("BusinessId"),
  KEY "fk_bm_user" ("UserId"),
  CONSTRAINT "fk_bm_business" FOREIGN KEY ("BusinessId") REFERENCES "businesses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_bm_user" FOREIGN KEY ("UserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================================
-- Tabla: clients
-- ========================================

DROP TABLE IF EXISTS `clients`;

CREATE TABLE "clients" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "firstName" varchar(255) NOT NULL,
  "lastName" varchar(255) DEFAULT NULL,
  "email" varchar(255) DEFAULT NULL,
  "phone" varchar(255) DEFAULT NULL,
  "address" varchar(255) DEFAULT NULL,
  "notes" text,
  "status" enum('active','inactive') DEFAULT 'active',
  "BusinessId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "createdById" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "fk_clients_business" ("BusinessId"),
  CONSTRAINT "fk_clients_business" FOREIGN KEY ("BusinessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================================
-- Tabla: payments
-- ========================================

DROP TABLE IF EXISTS `payments`;

CREATE TABLE "payments" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "amount" decimal(10,2) NOT NULL,
  "method" varchar(255) DEFAULT NULL,
  "date" datetime DEFAULT NULL,
  "SaleId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "createdAt" datetime DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "fk_payments_sale" ("SaleId"),
  CONSTRAINT "fk_payments_sale" FOREIGN KEY ("SaleId") REFERENCES "sales" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================================
-- Tabla: productimages
-- ========================================

DROP TABLE IF EXISTS `productimages`;

CREATE TABLE "productimages" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "imageUrl" varchar(255) NOT NULL,
  "isPrimary" tinyint(1) DEFAULT '0',
  "ProductId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "createdAt" datetime DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "fk_pi_product" ("ProductId"),
  CONSTRAINT "fk_pi_product" FOREIGN KEY ("ProductId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================================
-- Tabla: products
-- ========================================

DROP TABLE IF EXISTS `products`;

CREATE TABLE "products" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "costPrice" decimal(10,2) DEFAULT '0.00',
  "sellingPrice" decimal(10,2) NOT NULL,
  "stock" int DEFAULT '0',
  "status" enum('active','inactive') DEFAULT 'active',
  "BusinessId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "imageUrl" varchar(255) DEFAULT NULL,
  "createdAt" datetime DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "deletedAt" datetime DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "fk_products_business" ("BusinessId"),
  CONSTRAINT "fk_products_business" FOREIGN KEY ("BusinessId") REFERENCES "businesses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================================
-- Tabla: productvariants
-- ========================================

DROP TABLE IF EXISTS `productvariants`;

CREATE TABLE "productvariants" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "color" varchar(255) DEFAULT NULL,
  "size" varchar(255) DEFAULT NULL,
  "stock" int DEFAULT '0',
  "sku" varchar(255) DEFAULT NULL,
  "ProductId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "createdAt" datetime DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "fk_pv_product" ("ProductId"),
  CONSTRAINT "fk_pv_product" FOREIGN KEY ("ProductId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================================
-- Tabla: raffles
-- ========================================

DROP TABLE IF EXISTS `raffles`;

CREATE TABLE "raffles" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "motive" varchar(255) NOT NULL,
  "prize" varchar(255) DEFAULT NULL,
  "drawDate" datetime DEFAULT NULL,
  "status" enum('active','finished') DEFAULT 'active',
  "BusinessId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "ticketPrice" decimal(10,2) NOT NULL DEFAULT '100.00',
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "drawCriteria" int DEFAULT '1',
  "prizes" json DEFAULT NULL,
  "deletedAt" datetime DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "fk_raffles_business" ("BusinessId"),
  CONSTRAINT "fk_raffles_business" FOREIGN KEY ("BusinessId") REFERENCES "businesses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================================
-- Tabla: raffletickets
-- ========================================

DROP TABLE IF EXISTS `raffletickets`;

CREATE TABLE "raffletickets" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "number" int NOT NULL,
  "isWinner" tinyint(1) DEFAULT '0',
  "RaffleId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "SaleId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "customerId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "clientId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "place" int DEFAULT NULL,
  "deletedAt" datetime DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "fk_rt_raffle" ("RaffleId"),
  KEY "fk_rt_sale" ("SaleId"),
  KEY "fk_rt_client" ("clientId"),
  CONSTRAINT "fk_rt_client" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_rt_raffle" FOREIGN KEY ("RaffleId") REFERENCES "raffles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_rt_sale" FOREIGN KEY ("SaleId") REFERENCES "sales" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================================
-- Tabla: receipttokens
-- ========================================

DROP TABLE IF EXISTS `receipttokens`;

CREATE TABLE "receipttokens" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "parameters" json NOT NULL,
  "expiresAt" datetime NOT NULL,
  "viewCount" int NOT NULL DEFAULT '0',
  "lastViewedAt" datetime DEFAULT NULL,
  PRIMARY KEY ("id")
);

-- ========================================
-- Tabla: saledetails
-- ========================================

DROP TABLE IF EXISTS `saledetails`;

CREATE TABLE "saledetails" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "quantity" int NOT NULL,
  "unitPrice" decimal(10,2) NOT NULL,
  "SaleId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "ProductId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "ProductVariantId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "subtotal" decimal(10,2) NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "createdAt" datetime DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "fk_sd_sale" ("SaleId"),
  KEY "fk_sd_product" ("ProductId"),
  KEY "fk_sd_variant" ("ProductVariantId"),
  CONSTRAINT "fk_sd_product" FOREIGN KEY ("ProductId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_sd_sale" FOREIGN KEY ("SaleId") REFERENCES "sales" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_sd_variant" FOREIGN KEY ("ProductVariantId") REFERENCES "productvariants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================================
-- Tabla: sales
-- ========================================

DROP TABLE IF EXISTS `sales`;

CREATE TABLE "sales" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "total" decimal(10,2) NOT NULL,
  "status" enum('pending','delivered','cancelled') DEFAULT 'pending',
  "uuidTicket" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "paymentMethod" varchar(255) DEFAULT NULL,
  "deliveryPoint" varchar(255) DEFAULT NULL,
  "deliveryDate" datetime DEFAULT NULL,
  "notes" text,
  "BusinessId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "clientId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "createdById" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "receiptTokenId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "SellerId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "uuidTicket" ("uuidTicket"),
  KEY "fk_sales_business" ("BusinessId"),
  KEY "fk_sales_client" ("clientId"),
  KEY "fk_sales_creator" ("createdById"),
  KEY "fk_sales_token" ("receiptTokenId"),
  CONSTRAINT "fk_sales_business" FOREIGN KEY ("BusinessId") REFERENCES "businesses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_sales_client" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_sales_creator" FOREIGN KEY ("createdById") REFERENCES "businessmembers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_sales_token" FOREIGN KEY ("receiptTokenId") REFERENCES "receipttokens" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================================
-- Tabla: users
-- ========================================

DROP TABLE IF EXISTS `users`;

CREATE TABLE "users" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "firstName" varchar(255) DEFAULT NULL,
  "lastName" varchar(255) DEFAULT NULL,
  "email" varchar(255) DEFAULT NULL,
  "phone" varchar(255) NOT NULL,
  "password" varchar(255) DEFAULT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "createdAt" datetime DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "phone" ("phone"),
  UNIQUE KEY "email" ("email")
);

-- ========================================
-- ÍNDICES
-- ========================================

-- Índices de Businesses
-- UNIQUE INDEX slug ON Businesses (slug)

-- Índices de Users
-- UNIQUE INDEX phone ON Users (phone)
-- UNIQUE INDEX email ON Users (email)

-- Índices de businesses
-- UNIQUE INDEX slug ON businesses (slug)

-- Índices de businessmembers
-- UNIQUE INDEX accessToken ON businessmembers (accessToken)
-- UNIQUE INDEX localAlias ON businessmembers (localAlias)
-- INDEX fk_bm_business ON businessmembers (BusinessId)
-- INDEX fk_bm_user ON businessmembers (UserId)

-- Índices de clients
-- INDEX fk_clients_business ON clients (BusinessId)

-- Índices de payments
-- INDEX fk_payments_sale ON payments (SaleId)

-- Índices de productimages
-- INDEX fk_pi_product ON productimages (ProductId)

-- Índices de products
-- INDEX fk_products_business ON products (BusinessId)

-- Índices de productvariants
-- INDEX fk_pv_product ON productvariants (ProductId)

-- Índices de raffles
-- INDEX fk_raffles_business ON raffles (BusinessId)

-- Índices de raffletickets
-- INDEX fk_rt_raffle ON raffletickets (RaffleId)
-- INDEX fk_rt_sale ON raffletickets (SaleId)
-- INDEX fk_rt_client ON raffletickets (clientId)

-- Índices de receipttokens

-- Índices de saledetails
-- INDEX fk_sd_sale ON saledetails (SaleId)
-- INDEX fk_sd_product ON saledetails (ProductId)
-- INDEX fk_sd_variant ON saledetails (ProductVariantId)

-- Índices de sales
-- UNIQUE INDEX uuidTicket ON sales (uuidTicket)
-- INDEX fk_sales_business ON sales (BusinessId)
-- INDEX fk_sales_client ON sales (clientId)
-- INDEX fk_sales_creator ON sales (createdById)
-- INDEX fk_sales_token ON sales (receiptTokenId)

-- Índices de users
-- UNIQUE INDEX phone ON users (phone)
-- UNIQUE INDEX email ON users (email)

