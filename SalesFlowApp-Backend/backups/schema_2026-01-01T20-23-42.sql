-- ========================================
-- BACKUP DE ESTRUCTURA - SalesFlowApp
-- Fecha: 2026-01-01T20:23:44.470Z
-- Base de datos: defaultdb
-- ========================================

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
  "deletedAt" datetime DEFAULT NULL,
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
  "permissions" json DEFAULT NULL,
  "status" enum('active','inactive') DEFAULT 'active',
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "BusinessId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "UserId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "accessToken" ("accessToken"),
  UNIQUE KEY "localAlias" ("localAlias"),
  KEY "BusinessId" ("BusinessId"),
  KEY "UserId" ("UserId"),
  CONSTRAINT "businessmembers_ibfk_1" FOREIGN KEY ("BusinessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "businessmembers_ibfk_2" FOREIGN KEY ("UserId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
  PRIMARY KEY ("id"),
  UNIQUE KEY "idx_clients_business_phone" ("BusinessId","phone"),
  KEY "idx_clients_business_status" ("BusinessId","status"),
  KEY "idx_clients_business_name" ("BusinessId","firstName","lastName"),
  CONSTRAINT "clients_ibfk_1" FOREIGN KEY ("BusinessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "SaleId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "SaleId" ("SaleId"),
  CONSTRAINT "payments_ibfk_1" FOREIGN KEY ("SaleId") REFERENCES "sales" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================================
-- Tabla: productimages
-- ========================================

DROP TABLE IF EXISTS `productimages`;

CREATE TABLE "productimages" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "imageUrl" varchar(255) NOT NULL,
  "isPrimary" tinyint(1) DEFAULT '0',
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "ProductId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "ProductId" ("ProductId"),
  CONSTRAINT "productimages_ibfk_1" FOREIGN KEY ("ProductId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================================
-- Tabla: products
-- ========================================

DROP TABLE IF EXISTS `products`;

CREATE TABLE "products" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "imageUrl" varchar(255) DEFAULT NULL,
  "costPrice" decimal(10,2) DEFAULT '0.00',
  "sellingPrice" decimal(10,2) NOT NULL,
  "stock" int DEFAULT '0',
  "status" enum('active','inactive') DEFAULT 'active',
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "BusinessId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "idx_products_business_status" ("BusinessId","status"),
  KEY "idx_products_business_name" ("BusinessId","name"),
  KEY "idx_products_created_at" ("createdAt"),
  CONSTRAINT "products_ibfk_1" FOREIGN KEY ("BusinessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "ProductId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "ProductId" ("ProductId"),
  CONSTRAINT "productvariants_ibfk_1" FOREIGN KEY ("ProductId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
  "drawCriteria" int DEFAULT '1',
  "prizes" json DEFAULT NULL,
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "BusinessId" ("BusinessId"),
  CONSTRAINT "raffles_ibfk_1" FOREIGN KEY ("BusinessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
  "clientId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "place" int DEFAULT NULL,
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "RaffleId" ("RaffleId"),
  KEY "SaleId" ("SaleId"),
  KEY "clientId" ("clientId"),
  CONSTRAINT "raffletickets_ibfk_1" FOREIGN KEY ("RaffleId") REFERENCES "raffles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "raffletickets_ibfk_2" FOREIGN KEY ("SaleId") REFERENCES "sales" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "raffletickets_ibfk_3" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================================
-- Tabla: receipttokens
-- ========================================

DROP TABLE IF EXISTS `receipttokens`;

CREATE TABLE "receipttokens" (
  "id" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  "parameters" json NOT NULL,
  "expiresAt" datetime NOT NULL,
  "viewCount" int DEFAULT '0',
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
  "subtotal" decimal(10,2) NOT NULL,
  "unitPrice" decimal(10,2) NOT NULL,
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "SaleId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "ProductId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "ProductVariantId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "ProductVariantId" ("ProductVariantId"),
  KEY "idx_saledetails_sale" ("SaleId"),
  KEY "idx_saledetails_product" ("ProductId"),
  CONSTRAINT "saledetails_ibfk_1" FOREIGN KEY ("SaleId") REFERENCES "sales" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "saledetails_ibfk_2" FOREIGN KEY ("ProductId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "saledetails_ibfk_3" FOREIGN KEY ("ProductVariantId") REFERENCES "productvariants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
  "receiptTokenId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "SellerId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  "BusinessId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  "clientId" char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "uuidTicket" ("uuidTicket"),
  KEY "receiptTokenId" ("receiptTokenId"),
  KEY "SellerId" ("SellerId"),
  KEY "idx_sales_business_created" ("BusinessId","createdAt"),
  KEY "idx_sales_business_status" ("BusinessId","status"),
  KEY "idx_sales_client_business" ("clientId","BusinessId"),
  KEY "idx_sales_created_at" ("createdAt"),
  CONSTRAINT "sales_ibfk_1" FOREIGN KEY ("receiptTokenId") REFERENCES "receipttokens" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "sales_ibfk_2" FOREIGN KEY ("SellerId") REFERENCES "businessmembers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "sales_ibfk_3" FOREIGN KEY ("BusinessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sales_ibfk_4" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
  "createdAt" datetime NOT NULL,
  "updatedAt" datetime NOT NULL,
  "deletedAt" datetime DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "phone" ("phone"),
  UNIQUE KEY "email" ("email")
);

-- ========================================
-- ÍNDICES
-- ========================================

-- Índices de businesses
-- UNIQUE INDEX slug ON businesses (slug)

-- Índices de businessmembers
-- UNIQUE INDEX accessToken ON businessmembers (accessToken)
-- UNIQUE INDEX localAlias ON businessmembers (localAlias)
-- INDEX BusinessId ON businessmembers (BusinessId)
-- INDEX UserId ON businessmembers (UserId)

-- Índices de clients
-- UNIQUE INDEX idx_clients_business_phone ON clients (BusinessId, phone)
-- INDEX idx_clients_business_status ON clients (BusinessId, status)
-- INDEX idx_clients_business_name ON clients (BusinessId, firstName, lastName)

-- Índices de payments
-- INDEX SaleId ON payments (SaleId)

-- Índices de productimages
-- INDEX ProductId ON productimages (ProductId)

-- Índices de products
-- INDEX idx_products_business_status ON products (BusinessId, status)
-- INDEX idx_products_business_name ON products (BusinessId, name)
-- INDEX idx_products_created_at ON products (createdAt)

-- Índices de productvariants
-- INDEX ProductId ON productvariants (ProductId)

-- Índices de raffles
-- INDEX BusinessId ON raffles (BusinessId)

-- Índices de raffletickets
-- INDEX RaffleId ON raffletickets (RaffleId)
-- INDEX SaleId ON raffletickets (SaleId)
-- INDEX clientId ON raffletickets (clientId)

-- Índices de receipttokens

-- Índices de saledetails
-- INDEX ProductVariantId ON saledetails (ProductVariantId)
-- INDEX idx_saledetails_sale ON saledetails (SaleId)
-- INDEX idx_saledetails_product ON saledetails (ProductId)

-- Índices de sales
-- UNIQUE INDEX uuidTicket ON sales (uuidTicket)
-- INDEX receiptTokenId ON sales (receiptTokenId)
-- INDEX SellerId ON sales (SellerId)
-- INDEX idx_sales_business_created ON sales (BusinessId, createdAt)
-- INDEX idx_sales_business_status ON sales (BusinessId, status)
-- INDEX idx_sales_client_business ON sales (clientId, BusinessId)
-- INDEX idx_sales_created_at ON sales (createdAt)

-- Índices de users
-- UNIQUE INDEX phone ON users (phone)
-- UNIQUE INDEX email ON users (email)

