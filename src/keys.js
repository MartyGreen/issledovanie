/**
 * Криптографические ключи для JWT (EdDSA / Ed25519).
 *
 * BACKEND_PUBLIC_KEY_SPKI — открытый ключ бэкенда (SPKI DER, base64).
 *   Используется прототипом для ПРОВЕРКИ входящего JWT
 *   (бэкенд подписывает своим закрытым ключом).
 *
 * PROTOTYPE_PRIVATE_KEY_PKCS8 — закрытый ключ прототипа (PKCS8 DER, base64).
 *   Используется прототипом для ПОДПИСИ JWT-подтверждения
 *   прохождения исследования.
 *
 * Ключи предоставлены бэкенд-командой (Ed25519).
 */

// Открытый ключ бэкенда (SPKI DER, base64)
// PEM: MCowBQYDK2VwAyEAnm2VGHlsWNyNzIRwTIo4ap12BeJCudQk4iz95fBH71k=
export const BACKEND_PUBLIC_KEY_SPKI = 'MCowBQYDK2VwAyEAnm2VGHlsWNyNzIRwTIo4ap12BeJCudQk4iz95fBH71k='

// Закрытый ключ прототипа (PKCS8 DER, base64)
// PEM: MC4CAQAwBQYDK2VwBCIEIEIg3X+ZM1yzdKlCO543KCveT+2upxJgAXiRiEmaWr2+
export const PROTOTYPE_PRIVATE_KEY_PKCS8 = 'MC4CAQAwBQYDK2VwBCIEIEIg3X+ZM1yzdKlCO543KCveT+2upxJgAXiRiEmaWr2+'
