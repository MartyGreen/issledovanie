/**
 * Криптографические ключи для JWT (ES256 / ECDSA P-256).
 *
 * BACKEND_PUBLIC_KEY   — открытый ключ бэкенда.
 *   Используется прототипом для ПРОВЕРКИ входящего JWT
 *   (бэкенд подписывает своим закрытым ключом).
 *
 * PROTOTYPE_PRIVATE_KEY — закрытый ключ прототипа.
 *   Используется прототипом для ПОДПИСИ JWT-подтверждения
 *   прохождения исследования.
 *
 * Сгенерировано: scripts/generate-keys.mjs
 */

// Открытый ключ бэкенда (для проверки входящего JWT)
export const BACKEND_PUBLIC_KEY = {
  kty: 'EC',
  crv: 'P-256',
  x: 'DabHQu4Q8sYmf_gqaIpZs4zGyr_OOqJnpE46KpKxHDQ',
  y: 'qxMl0PQ8UCko_nvLbZy6fT9Isl_vIolqb6kEmnJUoGc',
  ext: true,
  key_ops: ['verify'],
}

// Закрытый ключ прототипа (для подписи JWT-подтверждения)
export const PROTOTYPE_PRIVATE_KEY = {
  kty: 'EC',
  crv: 'P-256',
  x: 'lXAXgpK3boZS8vkP-ark1TXpXnOoRwFEHxfELSDeQXA',
  y: 'NF8-9Nx9-pZuV7K_mEDGq_kZTz5u0cNiB2QUlsmyuoU',
  d: 'b26Aa1sfqVDt2BPZMupf8ZPL-fUefqElJGjSjUXajWw',
  ext: true,
  key_ops: ['sign'],
}
