#!/usr/bin/env node
/**
 * Генерация двух пар ES256 (ECDSA P-256) ключей:
 *
 * 1. backend-pair  — бэкенд подписывает JWT, прототип проверяет
 *    → backend_private.jwk  (отдать бэкенду, НЕ коммитить)
 *    → backend_public.jwk   (встроить в прототип)
 *
 * 2. prototype-pair — прототип подписывает JWT-подтверждение, бэкенд проверяет
 *    → prototype_private.jwk (встроить в прототип)
 *    → prototype_public.jwk  (отдать бэкенду)
 *
 * Запуск: node scripts/generate-keys.mjs
 */

import { webcrypto } from 'node:crypto'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'keys')

async function generateKeyPair(name) {
  const keyPair = await webcrypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true, // extractable
    ['sign', 'verify'],
  )

  const privateJwk = await webcrypto.subtle.exportKey('jwk', keyPair.privateKey)
  const publicJwk = await webcrypto.subtle.exportKey('jwk', keyPair.publicKey)

  writeFileSync(
    resolve(outDir, `${name}_private.jwk`),
    JSON.stringify(privateJwk, null, 2),
  )
  writeFileSync(
    resolve(outDir, `${name}_public.jwk`),
    JSON.stringify(publicJwk, null, 2),
  )

  console.log(`✅ ${name}_private.jwk — закрытый ключ`)
  console.log(`✅ ${name}_public.jwk  — открытый ключ`)
  return { privateJwk, publicJwk }
}

mkdirSync(outDir, { recursive: true })

console.log('\n🔑 Генерация ключей ES256 (ECDSA P-256)...\n')

const backend = await generateKeyPair('backend')
console.log()
const prototype = await generateKeyPair('prototype')

console.log('\n--- Для src/keys.js (скопируйте): ---\n')
console.log(`// Открытый ключ бэкенда (для проверки входящего JWT)`)
console.log(`export const BACKEND_PUBLIC_KEY = ${JSON.stringify(backend.publicJwk)};\n`)
console.log(`// Закрытый ключ прототипа (для подписи JWT-подтверждения)`)
console.log(`export const PROTOTYPE_PRIVATE_KEY = ${JSON.stringify(prototype.privateJwk)};\n`)
console.log(`// Открытый ключ прототипа (отдать бэкенду для проверки)`)
console.log(`export const PROTOTYPE_PUBLIC_KEY = ${JSON.stringify(prototype.publicJwk)};\n`)

console.log('📁 Ключи сохранены в директорию: keys/')
console.log('⚠️  Не коммитьте backend_private.jwk — он только для бэкенда!')
