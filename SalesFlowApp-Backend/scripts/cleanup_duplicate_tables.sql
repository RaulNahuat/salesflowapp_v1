-- ============================================
-- SCRIPT PARA ELIMINAR TABLAS DUPLICADAS
-- SalesFlowApp - Limpieza de Base de Datos
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Abre phpMyAdmin
-- 2. Selecciona tu base de datos
-- 3. Ve a la pestaña "SQL"
-- 4. Copia y pega este script completo
-- 5. Haz clic en "Continuar" o "Go"
--
-- IMPORTANTE: Este script elimina SOLO las tablas en SINGULAR
-- Las tablas en PLURAL (correctas) se mantienen intactas
-- ============================================

-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tablas duplicadas en SINGULAR
DROP TABLE IF EXISTS `business`;
DROP TABLE IF EXISTS `businessmember`;
DROP TABLE IF EXISTS `client`;
DROP TABLE IF EXISTS `payment`;
DROP TABLE IF EXISTS `product`;
DROP TABLE IF EXISTS `productimage`;
DROP TABLE IF EXISTS `productvariant`;
DROP TABLE IF EXISTS `raffle`;
DROP TABLE IF EXISTS `raffleticket`;
DROP TABLE IF EXISTS `receipttoken`;
DROP TABLE IF EXISTS `sale`;
DROP TABLE IF EXISTS `saledetail`;
DROP TABLE IF EXISTS `user`;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Después de ejecutar este script, verifica que solo
-- existan las tablas en PLURAL:
-- 
-- ✅ businesses
-- ✅ businessmembers
-- ✅ clients
-- ✅ payments
-- ✅ products
-- ✅ productimages
-- ✅ productvariants
-- ✅ raffles
-- ✅ raffletickets
-- ✅ receipttokens
-- ✅ sales
-- ✅ saledetails
-- ✅ users
-- ============================================

SELECT 'Tablas duplicadas eliminadas exitosamente' AS Resultado;
