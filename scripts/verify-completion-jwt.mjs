#!/usr/bin/env node
/**
 * Верифицирует JWT-подтверждение, подписанное прототипом.
 * Использует prototype_public.jwk из директории keys/.
 *
 * Запуск: node scripts/verify-completion-jwt.mjs "<jwt_token>"
 *
 * Этот скрипт имитирует то, что делал бы бэкенд при получении
 * callback-редиректа от прототипа.
 */

import { webcrypto } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const keysDir = resolve(__dirname, '..', 'keys')

function base64urlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) base64 += '='
  return Buffer.from(base64, 'base64')
}

const token = process.argv[2]
if (!token) {
  console.error('❌ Использование: node scripts/verify-completion-jwt.mjs "<jwt>"')
  process.exit(1)
}

const publicJwk = JSON.parse(
  readFileSync(resolve(keysDir, 'prototype_public.jwk'), 'utf-8'),
)

async function main() {
  const parts = token.split('.')
  if (parts.length !== 3) {
    console.error('❌ Неверный формат JWT')
    process.exit(1)
  }

  const [headerB64, payloadB64, signatureB64] = parts
  const header = JSON.parse(base64urlDecode(headerB64).toString())
  const payload = JSON.parse(base64urlDecode(payloadB64).toString())

  console.log('\n📋 Header:', JSON.stringify(header, null, 2))
  console.log('\n📋 Payload:', JSON.stringify(payload, null, 2))

  const key = await webcrypto.subtle.importKey(
    'jwk', publicJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['verify'],
  )

  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  const signature = new Uint8Array(base64urlDecode(signatureB64))

  const isValid = await webcrypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    key, signature, signedData,
  )

  if (isValid) {
    console.log('\n✅ Подпись ВАЛИДНА — прототип подтвердил прохождение')

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      console.log('⚠️  Но JWT уже истёк (exp:', new Date(payload.exp * 1000).toISOString(), ')')
    } else if (payload.exp) {
      console.log('⏰ JWT действителен до:', new Date(payload.exp * 1000).toISOString())
    }
  } else {
    console.log('\n❌ Подпись НЕВАЛИДНА')
  }
}

main().catch(console.error)
