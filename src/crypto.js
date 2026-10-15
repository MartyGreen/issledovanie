/**
 * JWT-криптография для прототипа (ES256 / ECDSA P-256).
 * Работает через встроенный Web Crypto API — 0 внешних зависимостей.
 *
 * Два сценария:
 * 1. verifyIncomingJWT(token)    — проверка JWT от бэкенда (открытый ключ бэкенда)
 * 2. signCompletionJWT(payload)  — подпись JWT-подтверждения (закрытый ключ прототипа)
 */

import { BACKEND_PUBLIC_KEY, PROTOTYPE_PRIVATE_KEY } from './keys.js'

/* ===== Утилиты Base64URL ===== */

function base64urlEncode(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) base64 += '='
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function encodeJwtPart(obj) {
  return base64urlEncode(new TextEncoder().encode(JSON.stringify(obj)))
}

function decodeJwtPart(str) {
  return JSON.parse(new TextDecoder().decode(base64urlDecode(str)))
}

/* ===== Импорт ключей (кэшируются) ===== */

let _backendPublicKey = null
let _prototypePrivateKey = null

async function getBackendPublicKey() {
  if (_backendPublicKey) return _backendPublicKey
  _backendPublicKey = await crypto.subtle.importKey(
    'jwk', BACKEND_PUBLIC_KEY,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['verify'],
  )
  return _backendPublicKey
}

async function getPrototypePrivateKey() {
  if (_prototypePrivateKey) return _prototypePrivateKey
  _prototypePrivateKey = await crypto.subtle.importKey(
    'jwk', PROTOTYPE_PRIVATE_KEY,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign'],
  )
  return _prototypePrivateKey
}

/* ===== Верификация входящего JWT ===== */

/**
 * Проверяет JWT, подписанный бэкендом (ES256).
 *
 * Ожидаемый payload от бэкенда:
 * { sub, study_id, redirect_url, iat, exp }
 *
 * @param {string} token — JWT строка
 * @returns {Promise<{valid: boolean, payload: object|null, error: string|null}>}
 */
export async function verifyIncomingJWT(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, payload: null, error: 'Неверный формат JWT' }
    }

    const [headerB64, payloadB64, signatureB64] = parts
    const header = decodeJwtPart(headerB64)
    if (header.alg !== 'ES256') {
      return { valid: false, payload: null, error: `Неподдерживаемый алгоритм: ${header.alg}` }
    }

    const payload = decodeJwtPart(payloadB64)

    // Проверяем срок действия
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return { valid: false, payload, error: 'JWT истёк (exp)' }
    }

    // Проверяем подпись
    const key = await getBackendPublicKey()
    const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    const signature = base64urlDecode(signatureB64)

    const isValid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      key, signature, signedData,
    )

    if (!isValid) {
      return { valid: false, payload, error: 'Подпись JWT невалидна' }
    }

    return { valid: true, payload, error: null }
  } catch (err) {
    return { valid: false, payload: null, error: `Ошибка верификации: ${err.message}` }
  }
}

/* ===== Подпись JWT-подтверждения ===== */

/**
 * Создаёт и подписывает JWT-подтверждение прохождения исследования.
 *
 * @param {object} payload — данные подтверждения
 * @returns {Promise<string>} — подписанный JWT
 */
export async function signCompletionJWT(payload) {
  const header = { alg: 'ES256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + 300, // 5 минут на редирект
  }

  const headerB64 = encodeJwtPart(header)
  const payloadB64 = encodeJwtPart(fullPayload)

  const key = await getPrototypePrivateKey()
  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(`${headerB64}.${payloadB64}`),
  )

  return `${headerB64}.${payloadB64}.${base64urlEncode(signatureBuffer)}`
}

/* ===== Вспомогательные функции ===== */

/** Парсит query-параметры state и token/jwt из URL */
export function parseAuthParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    state: params.get('state'),
    token: params.get('token') || params.get('jwt'),
  }
}

/** Очищает auth-параметры из URL без перезагрузки */
export function clearAuthParams() {
  const url = new URL(window.location.href)
  url.searchParams.delete('state')
  url.searchParams.delete('token')
  url.searchParams.delete('jwt')
  window.history.replaceState({}, '', url.pathname + url.hash)
}

/** Формирует URL редиректа с state и подписанным JWT */
export function buildRedirectUrl(redirectUrl, state, jwt) {
  const url = new URL(redirectUrl)
  url.searchParams.set('state', state)
  url.searchParams.set('token', jwt)
  return url.toString()
}
