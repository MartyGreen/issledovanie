#!/usr/bin/env node
/**
 * Генерирует тестовый JWT от имени бэкенда для проверки прототипа.
 * Использует backend_private.jwk из директории keys/.
 *
 * Запуск: node scripts/generate-test-jwt.mjs [redirect_url]
 *
 * Пример:
 *   node scripts/generate-test-jwt.mjs "https://example.com/callback"
 *
 * Выводит:
 *   - JWT токен
 *   - Полный URL для тестирования прототипа
 */

import { webcrypto } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const keysDir = resolve(__dirname, '..', 'keys')

// --- Base64URL утилиты ---
function base64urlEncode(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return Buffer.from(binary, 'binary')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function encodeJwtPart(obj) {
  const json = JSON.stringify(obj)
  return base64urlEncode(new TextEncoder().encode(json))
}

// --- Чтение ключа ---
const privateJwk = JSON.parse(
  readFileSync(resolve(keysDir, 'backend_private.jwk'), 'utf-8'),
)

// --- Параметры ---
const redirectUrl = process.argv[2] || 'https://example.com/callback'
const state = `test_state_${Date.now()}`
const sub = `user_${Math.random().toString(36).slice(2, 10)}`
const studyId = `study_${Math.random().toString(36).slice(2, 10)}`

// --- Подпись ---
async function main() {
  const key = await webcrypto.subtle.importKey(
    'jwk', privateJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign'],
  )

  const header = { alg: 'ES256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub,
    study_id: studyId,
    redirect_url: redirectUrl,
    iat: now,
    exp: now + 3600, // 1 час
  }

  const headerB64 = encodeJwtPart(header)
  const payloadB64 = encodeJwtPart(payload)
  const signingInput = `${headerB64}.${payloadB64}`

  const signature = await webcrypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(signingInput),
  )

  const jwt = `${signingInput}.${base64urlEncode(signature)}`

  console.log('\n🎫 Тестовый JWT (от имени бэкенда):')
  console.log('─'.repeat(60))
  console.log(jwt)
  console.log('─'.repeat(60))
  console.log('\n📋 Payload:')
  console.log(JSON.stringify(payload, null, 2))
  console.log(`\n🔗 State: ${state}`)
  console.log(`\n🌐 URL для тестирования (dev):`)
  const devUrl = `http://localhost:5173/?state=${encodeURIComponent(state)}&token=${encodeURIComponent(jwt)}`
  console.log(devUrl)
  console.log(`\n🌐 URL для тестирования (production):`)
  const prodUrl = `https://<username>.github.io/issledovanie/?state=${encodeURIComponent(state)}&token=${encodeURIComponent(jwt)}`
  console.log(prodUrl)
}

main().catch(console.error)
