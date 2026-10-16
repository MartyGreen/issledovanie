#!/usr/bin/env node
/**
 * Генерация двух пар Ed25519 ключей:
 *
 * 1. backend-pair  — бэкенд подписывает JWT, прототип проверяет
 *    → backend_private.pem  (отдать бэкенду, НЕ коммитить)
 *    → backend_public.pem   (встроить в прототип)
 *
 * 2. prototype-pair — прототип подписывает JWT-подтверждение, бэкенд проверяет
 *    → prototype_private.pem (встроить в прототип)
 *    → prototype_public.pem  (отдать бэкенду)
 *
 * Запуск: node scripts/generate-keys.mjs
 *
 * ПРИМЕЧАНИЕ: Текущие ключи предоставлены бэкенд-командой.
 * Этот скрипт используется для генерации НОВЫХ ключей при необходимости.
 */

import { webcrypto } from 'node:crypto'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'keys')

async function generateKeyPair(name) {
  const keyPair = await webcrypto.subtle.generateKey(
    { name: 'Ed25519' },
    true, // extractable
    ['sign', 'verify'],
  )

  const pkcs8 = await webcrypto.subtle.exportKey('pkcs8', keyPair.privateKey)
  const spki = await webcrypto.subtle.exportKey('spki', keyPair.publicKey)

  const privBase64 = Buffer.from(pkcs8).toString('base64')
  const pubBase64 = Buffer.from(spki).toString('base64')

  const privPem = `-----BEGIN PRIVATE KEY-----\n${privBase64}\n-----END PRIVATE KEY-----\n`
  const pubPem = `-----BEGIN PUBLIC KEY-----\n${pubBase64}\n-----END PUBLIC KEY-----\n`

  writeFileSync(resolve(outDir, `${name}_private.pem`), privPem)
  writeFileSync(resolve(outDir, `${name}_public.pem`), pubPem)

  console.log(`✅ ${name}_private.pem — закрытый ключ`)
  console.log(`✅ ${name}_public.pem  — открытый ключ`)
  return { privBase64, pubBase64 }
}

mkdirSync(outDir, { recursive: true })

console.log('\n🔑 Генерация ключей EdDSA (Ed25519)...\n')

const backend = await generateKeyPair('backend')
console.log()
const prototype = await generateKeyPair('prototype')

console.log('\n--- Для src/keys.js (скопируйте): ---\n')
console.log(`// Открытый ключ бэкенда (SPKI DER, base64)`)
console.log(`export const BACKEND_PUBLIC_KEY_SPKI = '${backend.pubBase64}';\n`)
console.log(`// Закрытый ключ прототипа (PKCS8 DER, base64)`)
console.log(`export const PROTOTYPE_PRIVATE_KEY_PKCS8 = '${prototype.privBase64}';\n`)

console.log('📁 Ключи сохранены в директорию: keys/')
console.log('⚠️  Не коммитьте backend_private.pem — он только для бэкенда!')
console.log('📤 Отдайте бэкенду: prototype_public.pem')
