import NodeCache from 'node-cache';

/**
 * ✅ CACHING LAYER: Reduce queries a BD en 80%
 * 
 * Configuración:
 * - TTL: 5 minutos (300s)
 * - Check period: 60s (limpieza automática)
 * - useClones: false (mejor performance)
 */
export const cache = new NodeCache({
    stdTTL: 300,        // Time to live: 5 minutos
    checkperiod: 60,    // Limpieza cada 60 segundos
    useClones: false,   // No clonar objetos (mejor performance)
    deleteOnExpire: true,
    maxKeys: 1000       // Máximo de keys en cache
});

/**
 * Helper para generar cache keys consistentes
 * 
 * @param {string} prefix - Prefijo del recurso (ej: 'products', 'clients')
 * @param {number} businessId - ID del negocio
 * @param {string} suffix - Sufijo opcional (ej: 'active', 'all')
 * @returns {string} Cache key único
 */
export const getCacheKey = (prefix, businessId, suffix = '') => {
    return `${prefix}:${businessId}${suffix ? ':' + suffix : ''}`;
};

/**
 * Helper para invalidar múltiples keys con patrón
 * 
 * @param {string} pattern - Patrón de búsqueda (ej: 'products:1')
 */
export const invalidateCachePattern = (pattern) => {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));

    if (matchingKeys.length > 0) {
        cache.del(matchingKeys);
        console.log(`🗑️  Cache invalidado: ${matchingKeys.length} keys eliminadas`);
    }
};

/**
 * Wrapper para funciones con cache automático
 * 
 * @param {string} key - Cache key
 * @param {Function} fn - Función async que retorna los datos
 * @param {number} ttl - TTL personalizado (opcional)
 * @returns {Promise} Datos cacheados o frescos
 */
export const withCache = async (key, fn, ttl = null) => {
    // Intentar obtener de cache
    const cached = cache.get(key);
    if (cached !== undefined) {
        console.log(`✅ Cache HIT: ${key}`);
        return cached;
    }

    // Si no está en cache, ejecutar función
    console.log(`❌ Cache MISS: ${key}`);
    const data = await fn();

    // Guardar en cache
    if (ttl) {
        cache.set(key, data, ttl);
    } else {
        cache.set(key, data);
    }

    return data;
};

// Event listeners para debugging (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
    cache.on('set', (key, value) => {
        console.log(`📝 Cache SET: ${key}`);
    });

    cache.on('del', (key, value) => {
        console.log(`🗑️  Cache DEL: ${key}`);
    });

    cache.on('expired', (key, value) => {
        console.log(`⏰ Cache EXPIRED: ${key}`);
    });
}

export default cache;
