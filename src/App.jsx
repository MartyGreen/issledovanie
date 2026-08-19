import { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import './index.css'

/* ===== Firebase Realtime Database (REST API) ===== */
const FIREBASE_DB_URL = 'https://datagatetest-4f190-default-rtdb.firebaseio.com'

async function firebasePush(path, data) {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    return result?.name // returns the generated key
  } catch (err) {
    console.warn('Firebase push failed:', err)
    return null
  }
}

async function firebaseUpdate(path, data) {
  try {
    await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (err) {
    console.warn('Firebase update failed:', err)
  }
}

async function firebaseFetchAll(path) {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`)
    const data = await res.json()
    if (!data) return []
    // Firebase returns {key1: {...}, key2: {...}} — convert to array
    return Object.entries(data).map(([key, val]) => ({ ...val, _firebaseKey: key }))
  } catch (err) {
    console.warn('Firebase fetch failed:', err)
    return []
  }
}

/* ===== CSV Export ===== */
function exportParticipantsCSV(participantsArg) {
  const participants = participantsArg || JSON.parse(localStorage.getItem('research_participants') || '[]')
  if (participants.length === 0) return

  const surveyHeaders = ['ease_of_use', 'ai_attitude', 'llm_usage', 'improvements', 'unclear']
  const headers = ['№', 'Имя', 'Фамилия', 'Грейд', 'Должность', 'Дата регистрации', 'Кликов', 'Длительность сессии (сек)', ...surveyHeaders.map(h => `Опросник: ${h}`)]

  const rows = participants.map((p, i) => {
    const surveyValues = surveyHeaders.map(h => {
      const val = p.surveyAnswers?.[h] || ''
      return `"${String(val).replace(/"/g, '""')}"`
    })
    return [
      i + 1,
      `"${(p.firstName || '').replace(/"/g, '""')}"`,
      `"${(p.lastName || '').replace(/"/g, '""')}"`,
      `"${(p.grade || '').replace(/"/g, '""')}"`,
      `"${(p.position || '').replace(/"/g, '""')}"`,
      `"${(p.registeredAt || '').replace(/"/g, '""')}"`,
      p.totalClicks || 0,
      p.sessionDuration ? Math.round(p.sessionDuration / 1000) : 0,
      ...surveyValues,
    ].join(',')
  })

  const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `research_participants_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* ===== SVG Иконки (inline) ===== */
const ChevronDown = ({ className }) => (
  <svg className={className} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CrossIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4l8 8M12 4l-8 8" stroke="#835de1" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const SparkleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1L9.5 5.5L14 7L9.5 8.5L8 13L6.5 8.5L2 7L6.5 5.5L8 1Z" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.5 1.5L13 3L14.5 3.5L13 4L12.5 5.5L12 4L10.5 3.5L12 3L12.5 1.5Z" stroke="#835de1" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)


const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3V13M3 8H13" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const PlusBrandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v10M3 8h10" stroke="#835de1" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="8" stroke="#f98e88" strokeWidth="1.5"/>
    <path d="M9 5.5v4M9 12.5v.01" stroke="#f98e88" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const CheckmarkIcon = ({ size = 24, color = "#3F9180" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19.2655 4.32106C19.6401 3.91566 20.2729 3.89092 20.6786 4.26539C21.0833 4.64012 21.1085 5.27303 20.7342 5.67848L8.73423 18.6785C8.34912 19.095 7.69429 19.1075 7.29282 18.7068L3.29282 14.7068C2.90235 14.3163 2.90244 13.6833 3.29282 13.2927C3.68334 12.9022 4.31636 12.9022 4.70688 13.2927L7.97055 16.5564L19.2655 4.32106Z" fill={color}/>
  </svg>
)

const MagicWandIcon = ({ size = 24, color = "#835de1" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3.5 20.5L14 10M10 14L20.5 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 8.5L19.5 6.5L21.5 5.5L19.5 4.5L18.5 2.5L17.5 4.5L15.5 5.5L17.5 6.5L18.5 8.5Z" fill={color}/>
    <path d="M8.5 6.5L9.25 4.75L11 4L9.25 3.25L8.5 1.5L7.75 3.25L6 4L7.75 4.75L8.5 6.5Z" fill={color}/>
    <path d="M4.5 11.5L5.25 9.75L7 9L5.25 8.25L4.5 6.5L3.75 8.25L2 9L3.75 9.75L4.5 11.5Z" fill={color}/>
  </svg>
)

const Spinner = ({ size = 24 }) => (
  <div className={`spinner ${size === 24 ? 'spinner-m' : 'spinner-xl'}`}>
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12" stroke="#835de1" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  </div>
)

const TrashIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: active ? 1 : 0.25 }}>
    <path d="M3 5h14M8 5V3h4v2M6 5v11a1 1 0 001 1h6a1 1 0 001-1V5" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ===== Данные для дропдаунов (из онбординга) ===== */
const ownerOptions = [
  'МРП Екатеринбург 2 (Бухтим)',
  'Бухгалтерия (Клиентский офис)',
  'Софт для буха (Бухгалтерский бизнес)',
  'Внешнее обучение (Опыт и результат сотрудника)',
  'AI-ассистент бухгалтера (Data-команда)',
  'Бухгалтерия Точка Рекламы (Финансы Рекламного бизнеса)',
  'Персональная бухгалтерия (Бухгалтерия)',
  'Данные Онлайн-бухгалтерии и ЭДО (Бухгалтерский бизнес)',
  'Клиентский сервис Санкт-Петербург (Открытие счета)',
  'Бухтим (Партнерские каналы продаж)',
  'Дизайн Онлайн-бухгалтерии и ЭДО (Бухгалтерский бизнес)',
  'Забота о клиентах Онлайн-бухгалтерии и ЭДО (Бухгалтерский бизнес)',
  'Бухгалтерский бизнес (Якорный Круг)',
  'Техподдержка Онлайн-бухгалтерии и ЭДО (Бухгалтерский бизнес)',
]

const databaseOptions = ['Oracle', 'ClickHouse', 'GreenPlum']

const schemaOptions = {
  'Oracle': ['STAGE', 'DWH', 'ODS', 'MART'],
  'ClickHouse': ['STAGE', 'RAW', 'DWH', 'ANALYTICS'],
  'GreenPlum': ['PUBLIC', 'STAGE', 'DWH', 'SANDBOX'],
}

const tableOptions = {
  'STAGE': ['ecom_team.prelead_seller_sign', 'ecom_team.orders', 'ecom_team.customers'],
  'DWH': ['dim_client', 'fact_orders', 'dim_product'],
  'ODS': ['ods_transactions', 'ods_accounts', 'ods_contracts'],
  'MART': ['mart_sales', 'mart_retention', 'mart_funnel'],
  'RAW': ['raw_events', 'raw_clicks', 'raw_sessions'],
  'ANALYTICS': ['report_daily', 'report_weekly', 'report_monthly'],
  'PUBLIC': ['users', 'orders', 'products'],
  'SANDBOX': ['tmp_analysis', 'tmp_model', 'tmp_export'],
}

const popularTagsByOwner = {
  'МРП Екатеринбург 2 (Бухтим)': ['МРП', 'Екатеринбург', 'Бухтим', 'Производство', 'Учёт', 'Склад'],
  'Бухгалтерия (Клиентский офис)': ['Бухгалтерия', 'Клиенты', 'Первичка', 'Сверка', 'Акты', 'Счета'],
  'Софт для буха (Бухгалтерский бизнес)': ['1С', 'Автоматизация', 'Отчётность', 'ЭДО', 'Интеграция', 'Баланс'],
  'Внешнее обучение (Опыт и результат сотрудника)': ['Обучение', 'Курсы', 'Сертификация', 'Развитие', 'HR', 'Компетенции'],
  'AI-ассистент бухгалтера (Data-команда)': ['AI', 'ML', 'Data', 'Ассистент', 'NLP', 'Автоматизация'],
  'Бухгалтерия Точка Рекламы (Финансы Рекламного бизнеса)': ['Реклама', 'Финансы', 'Бюджет', 'Медиаплан', 'ROI', 'Кампании'],
  'Персональная бухгалтерия (Бухгалтерия)': ['Персональная', 'Бухгалтерия', 'Налоги', 'НДФЛ', 'Декларация', 'Расходы'],
  'Данные Онлайн-бухгалтерии и ЭДО (Бухгалтерский бизнес)': ['Данные', 'Онлайн-бухгалтерия', 'ЭДО', 'Аналитика', 'DWH', 'ETL'],
  'Клиентский сервис Санкт-Петербург (Открытие счета)': ['Клиентский сервис', 'СПб', 'Открытие счета', 'Обслуживание', 'Заявки', 'KYC'],
  'Бухтим (Партнерские каналы продаж)': ['Бухтим', 'Партнёры', 'Каналы продаж', 'Дистрибуция', 'Агенты', 'Воронка'],
  'Дизайн Онлайн-бухгалтерии и ЭДО (Бухгалтерский бизнес)': ['Дизайн', 'UX', 'UI', 'Прототипы', 'Исследования', 'Фигма'],
  'Забота о клиентах Онлайн-бухгалтерии и ЭДО (Бухгалтерский бизнес)': ['Забота', 'Клиенты', 'NPS', 'Обратная связь', 'Retention', 'Поддержка'],
  'Бухгалтерский бизнес (Якорный Круг)': ['Бухгалтерский бизнес', 'Стратегия', 'OKR', 'Метрики', 'P&L', 'Roadmap'],
  'Техподдержка Онлайн-бухгалтерии и ЭДО (Бухгалтерский бизнес)': ['Техподдержка', 'Инциденты', 'SLA', 'Тикеты', 'Мониторинг', 'Баги'],
}

const defaultPopularTags = ['ORACLE', 'DOCUMENT', 'ЭДО', 'Документооборот', 'ЭПД', 'DWH', 'ETL', 'Метрики']

/* ===== Base URL helper ===== */
const base = import.meta.env.BASE_URL

/* ===== Sidebar ===== */
const mainMenuItems = [
  { icon: `${base}assets/icon-document-book.svg`, label: 'Документация', active: true, badge: 5 },
  { icon: `${base}assets/icon-person.svg`, label: 'Команда' },
  { icon: `${base}assets/icon-integration.svg`, label: 'Сессия' },
  { icon: `${base}assets/icon-file.svg`, label: 'Загрузчик файлов' },
  { icon: `${base}assets/icon-check-circle.svg`, label: 'Bi-API методы' },
  { icon: `${base}assets/icon-upload-arrow.svg`, label: 'Управление загрузками' },
  { icon: `${base}assets/icon-pencil.svg`, label: 'Редактор SQL' },
]

const mapItem = { icon: `${base}assets/icon-layout-grid.svg`, label: 'Карта сервисов' }

const bottomItems = [
  { icon: `${base}assets/icon-document-book-2.svg`, label: 'Есть идея' },
  { icon: `${base}assets/icon-help-circle.svg`, label: 'Нужна помощь' },
]

function Sidebar({ onIdeaClick, currentPage, userName, onLogoClick, onLogout }) {
  const [navHovered, setNavHovered] = useState(false)
  const [badgeHovered, setBadgeHovered] = useState(false)

  const isPulsing = navHovered || badgeHovered

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={onLogoClick} style={{ cursor: onLogoClick ? 'pointer' : 'default' }} title="На главную">
        <span className="sidebar-logo-text">DataGate</span>
        {/* SVG логотип оставлен скрытым для совместимости */}
        <svg className="logo-svg" style={{ display: 'none' }} preserveAspectRatio="xMidYMid meet" overflow="visible" width="143.276" height="31" viewBox="0 0 143.276 31" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle className={`logo-dot ${isPulsing ? 'pulsing' : ''}`} cx="139.688" cy="20.598" r="3.588" fill="#835DE1" />
          <path d="M76.4629 6.88086C80.0288 6.88086 81.5977 9.5557 81.6074 9.57227H81.7432V7.22168H85.5586V22.3477C85.5584 27.287 81.8456 30.9999 76.9062 31C72.1876 31 69.8027 27.6174 69.7861 27.5938L72.3076 25.1406C72.3244 25.1627 74.025 27.3887 76.9062 27.3887C79.8357 27.3886 81.743 25.4815 81.7432 22.3477V20.8486H81.6074C81.5953 20.869 80.026 23.5059 76.4629 23.5059C72.6817 23.5056 69.1387 19.9625 69.1387 15.1934C69.1387 10.4243 72.6817 6.88109 76.4629 6.88086ZM16.9648 23.8467H13.1836V21.4619H13.0479C13.0419 21.472 11.4389 24.1865 7.5625 24.1865C3.57688 24.1864 4.07708e-05 20.6099 0 15.5342C0 10.4584 3.57686 6.881 7.5625 6.88086C11.446 6.88086 13.0479 9.60645 13.0479 9.60645H13.1836V0H16.9648V23.8467ZM26.6904 6.88086C30.7781 6.88106 33.6396 9.8111 33.6396 13.4561V23.8457H29.8242V21.5977H29.6875C29.6814 21.6077 28.1137 24.1865 24.6797 24.1865C21.4438 24.1863 19.2297 21.9727 19.2295 19.418C19.2295 16.6928 21.2393 14.683 24.1348 14.1719L29.8242 13.1494V13.1152C29.8241 11.8548 28.4614 10.458 26.5537 10.458C24.0669 10.458 22.4316 12.5703 22.4316 12.5703L20.0811 10.2197C20.0811 10.2197 22.4322 6.88086 26.6904 6.88086ZM41.5586 7.49414H45.3057V11.1055H41.5586V18.0205C41.5586 19.7236 42.4102 20.576 43.8066 20.5762C44.8286 20.5762 45.8174 20.0645 45.8174 20.0645V23.6758C45.8174 23.6758 44.6585 24.1865 42.9893 24.1865C39.7531 24.1864 37.7432 22.1769 37.7432 18.4639V11.1055H34.6777V7.49414H36.4492C37.5731 7.49402 38.0839 6.98342 38.084 5.62109V2.18066H41.5586V7.49414ZM54.7061 6.88086C58.7939 6.88095 61.6553 9.81104 61.6553 13.4561V23.8467H57.8398V21.5977H57.7041C57.6909 21.6194 56.1221 24.1864 52.6963 24.1865C49.4603 24.1864 47.2453 21.9727 47.2451 19.418C47.2451 16.6928 49.2559 14.6829 52.1514 14.1719L57.8398 13.1494V13.1152C57.8397 11.8548 56.477 10.458 54.5693 10.458C52.0828 10.4583 50.4473 12.5703 50.4473 12.5703L48.0967 10.2197C48.0967 10.2197 50.448 6.881 54.7061 6.88086ZM95.1562 6.88086C99.2442 6.88086 102.105 9.81098 102.105 13.4561V23.8457H98.29V21.5977H98.1543C98.1543 21.5977 96.5871 24.1865 93.1465 24.1865C89.9104 24.1865 87.6965 21.9728 87.6963 19.418C87.6963 16.6927 89.7059 14.6829 92.6016 14.1719L98.29 13.1494V13.1152C98.29 11.8549 96.9279 10.4582 95.0205 10.458C92.5461 10.458 90.9146 12.5495 90.8984 12.5703L88.5479 10.2197C88.5664 10.1935 90.9149 6.88091 95.1562 6.88086ZM123.614 6.88086C128.349 6.88086 131.756 10.5603 131.756 15.1592C131.756 16.1812 131.586 16.999 131.586 16.999H119.084C119.493 18.9407 121.23 20.6777 123.955 20.6777C126.828 20.6777 128.561 18.5989 128.588 18.5664L130.769 21.2568C130.769 21.2568 128.554 24.1864 123.785 24.1865C118.88 24.1865 114.996 20.3034 114.996 15.5342C114.996 10.765 118.879 6.88096 123.614 6.88086ZM109.728 7.08887H113.475V10.6992H109.728V17.6152C109.728 19.3184 110.579 20.1699 111.976 20.1699C112.989 20.1699 113.969 19.6678 113.985 19.6592V23.2695C113.985 23.2695 112.827 23.7812 111.158 23.7812C107.922 23.7812 105.912 21.7708 105.912 18.0576V10.6992H102.846V7.08887H104.617C105.741 7.08887 106.253 6.57749 106.253 5.21484V1.77441H109.728V7.08887ZM25.7021 16.8623C23.7605 17.2029 23.0109 17.9186 23.0107 18.9404C23.0107 19.9964 24.0328 21.0185 25.6338 21.0186C27.9162 21.0186 29.8242 19.111 29.8242 16.6582V16.1475L25.7021 16.8623ZM53.7178 16.8623C51.7764 17.203 51.0265 17.9186 51.0264 18.9404C51.0264 19.9963 52.0487 21.0183 53.6494 21.0186C55.9318 21.0186 57.8398 19.1109 57.8398 16.6582V16.1475L53.7178 16.8623ZM94.168 16.8623C92.2266 17.203 91.4777 17.9186 91.4775 18.9404C91.4775 19.9965 92.4995 21.0186 94.1006 21.0186C96.3829 21.0184 98.29 19.1109 98.29 16.6582V16.1475L94.168 16.8623ZM8.48242 10.6289C5.89344 10.629 3.81543 12.7408 3.81543 15.5342C3.81547 18.3616 5.89347 20.4394 8.48242 20.4395C11.0714 20.4395 13.1836 18.3616 13.1836 15.5342C13.1836 12.7408 11.0714 10.6289 8.48242 10.6289ZM77.417 10.5264C74.8621 10.5264 72.9541 12.4341 72.9541 15.1934C72.9541 17.9527 74.8621 19.8945 77.417 19.8945C79.8357 19.8945 81.7432 17.9527 81.7432 15.1934C81.7432 12.434 79.8357 10.5264 77.417 10.5264ZM123.479 10.458C121.06 10.458 119.663 11.8893 119.084 13.8311H127.668C127.157 11.8894 125.727 10.4581 123.479 10.458Z" fill="#191919"/>
        </svg>
      </div>

      <nav className="sidebar-nav" onMouseEnter={() => setNavHovered(true)} onMouseLeave={() => { setNavHovered(false); setBadgeHovered(false) }}>
        <div className="sidebar-menu-group">
          {mainMenuItems.map((item) => (
            <button
              key={item.label}
              className={`sidebar-item ${item.active ? 'active' : ''}`}
              onMouseEnter={item.badge ? () => setBadgeHovered(true) : undefined}
              onMouseLeave={item.badge ? () => setBadgeHovered(false) : undefined}
            >
              <img src={item.icon} alt="" className="sidebar-item-icon" />
              <span>{item.label}</span>
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </button>
          ))}
        </div>

        <div className="sidebar-menu-group map-group">
          <button className="sidebar-item">
            <img src={mapItem.icon} alt="" className="sidebar-item-icon" />
            <span>{mapItem.label}</span>
          </button>
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-bottom">
          <div className="sidebar-bottom-card">
            {bottomItems.map((item) => (
              <button
                key={item.label}
                className={`sidebar-item ${item.label === 'Есть идея' && currentPage === 'admin' ? 'active' : ''}`}
                onClick={item.label === 'Есть идея' && onIdeaClick ? onIdeaClick : undefined}
              >
                <img src={item.icon} alt="" className="sidebar-item-icon" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <button className="sidebar-user">
            <div className="sidebar-avatar">
              <img src={`${base}assets/avatar-cat.jpg`} alt="Avatar" />
            </div>
            <span className="sidebar-user-name">{userName || 'Никита Сокол'}</span>
            {onLogout && (
              <span className="sidebar-logout-btn" onClick={(e) => { e.stopPropagation(); onLogout() }} title="Выйти и пройти тест заново">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#949494" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            )}
          </button>
        </div>
      </nav>
    </aside>
  )
}

/* ===== Dropdown ===== */
function Dropdown({ label, placeholder, options, value, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="dropdown" ref={ref}>
      <button
        className={`dropdown-trigger ${open ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
      >
        <div className="dropdown-trigger-content">
          <span className="dropdown-label">{label}</span>
          {value ? (
            <span className="dropdown-value">{value}</span>
          ) : (
            <span className="dropdown-placeholder">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`dropdown-chevron ${open ? 'open' : ''}`} />
      </button>
      {open && options.length > 0 && (
        <div className="dropdown-menu">
          {options.map((opt) => (
            <button
              key={opt}
              className={`dropdown-option ${value === opt ? 'selected' : ''}`}
              onMouseDown={() => { onChange(opt); setOpen(false) }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ===== Switch ===== */
function Switch({ title, description, checked, onChange }) {
  return (
    <div className="switch-section">
      <div className="switch-text">
        <div className="switch-title">{title}</div>
        <div className="switch-description">{description}</div>
      </div>
      <button className={`switch-toggle ${checked ? 'on' : 'off'}`} onClick={() => onChange(!checked)}>
        <div className={`switch-knob ${checked ? 'on' : 'off'}`} />
      </button>
    </div>
  )
}

/* ===== TextEditor ===== */
function TextEditor({ value, onChange, placeholder, isGenerating, onGenerate, disableGenerate, llmSuggestion, onAcceptSuggestion, onDismissSuggestion }) {
  const maxLen = 5000
  return (
    <div className="text-editor">
      <div className="text-editor-content">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLen))}
          placeholder={placeholder}
          rows={4}
        />
        {llmSuggestion && (
          <div className="llm-suggestion">
            <button className="llm-dismiss-btn" onClick={onDismissSuggestion} title="Закрыть">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#949494" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <p className="llm-suggestion-text"><span className="llm-suggestion-prefix">LLM:</span> {llmSuggestion}</p>
            <button className="llm-accept-btn" onClick={onAcceptSuggestion}>Принять</button>
          </div>
        )}
      </div>
      <div className="text-editor-toolbar">
        <div className="toolbar-actions">
          <button className="toolbar-btn" title="Заголовок"><b>T</b></button>
          <button className="toolbar-btn" title="Жирный"><b>B</b></button>
          <button className="toolbar-btn" title="Список">≡</button>
          <button className="toolbar-btn" title="Ссылка">🔗</button>
        </div>
        <span className="toolbar-counter">{value.length} / {maxLen}</span>
      </div>
    </div>
  )
}

/* ===== Tags Input ===== */
function TagsInput({ tags, setTags, owner }) {
  const [input, setInput] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const popularTags = owner ? (popularTagsByOwner[owner] || defaultPopularTags) : defaultPopularTags

  const filteredTags = input.trim()
    ? popularTags.filter(t => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t))
    : popularTags.filter(t => !tags.includes(t))

  const showCreateOption = input.trim()
    && !popularTags.some(t => t.toLowerCase() === input.trim().toLowerCase())
    && !tags.includes(input.trim())

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const addTag = (tag) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed])
    }
    setInput('')
    setDropdownOpen(false)
    inputRef.current?.focus()
  }

  const removeTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  return (
    <div className="tags-section" ref={containerRef}>
      <div className="tags-label">Теги</div>
      <div
        className={`tags-input-container ${dropdownOpen ? 'focused' : ''}`}
        onClick={() => { setDropdownOpen(true); inputRef.current?.focus() }}
      >
        <div className="tags-input-row">
          {tags.map(tag => (
            <span className="tag-chip" key={tag}>
              {tag}
              <span className="tag-chip-remove" onClick={(e) => { e.stopPropagation(); removeTag(tag) }}>
                <CrossIcon />
              </span>
            </span>
          ))}
          <input
            ref={inputRef}
            className="tags-input"
            value={input}
            onChange={(e) => { setInput(e.target.value); setDropdownOpen(true) }}
            onFocus={() => setDropdownOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                e.preventDefault()
                addTag(input)
              }
              if (e.key === 'Backspace' && !input && tags.length) {
                removeTag(tags[tags.length - 1])
              }
            }}
            placeholder={tags.length === 0 ? 'Начните вводить тег...' : ''}
          />
        </div>
      </div>
      {dropdownOpen && (filteredTags.length > 0 || showCreateOption) && (
        <div className="tags-dropdown">
          {filteredTags.map(s => (
            <button key={s} className="tags-dropdown-item" onMouseDown={() => addTag(s)}>
              {s}
            </button>
          ))}
          {showCreateOption && (
            <button className="tags-dropdown-item create" onMouseDown={() => addTag(input)}>
              <PlusBrandIcon />
              <span>Создать «{input.trim()}»</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ===== Storage Type Chips ===== */
function StorageChips({ value, onChange }) {
  return (
    <div className="storage-chips">
      <button
        className={`storage-chip ${value === 'DWH' ? 'active' : ''}`}
        onClick={() => onChange('DWH')}
      >
        DWH
      </button>
      <button
        className={`storage-chip ${value === 'external' ? 'active' : ''}`}
        onClick={() => onChange('external')}
      >
        Внешний источник
      </button>
    </div>
  )
}

/* ===== AI Generate Label ===== */
function AIGenerateLabel({ text = 'Сгенерировать общее описание', onClick, isGenerating, disabled }) {
  const isDisabled = isGenerating || disabled
  return (
    <button className={`ai-generate-label ${isGenerating ? 'generating' : ''} ${isDisabled ? 'disabled' : ''}`} onClick={onClick} disabled={isDisabled}>
      <span>{isGenerating ? 'Генерация...' : text}</span>
    </button>
  )
}

/* ===== Contextual Notification (inline) ===== */
function ContextualNotification({ title, text, onDismiss, visible }) {
  if (!visible) return null
  return (
    <div className="contextual-notification">
      <div className="contextual-notification-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.25 2.5L5 11.25H10L8.75 17.5L15 8.75H10L11.25 2.5Z" fill="#835de1"/>
        </svg>
      </div>
      <div className="contextual-notification-content">
        {title && <div className="contextual-notification-title">{title}</div>}
        {text && <div className="contextual-notification-text">{text}</div>}
      </div>
      {onDismiss && (
        <button className="contextual-notification-close" onClick={onDismiss} title="Закрыть">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      )}
    </div>
  )
}

/* ===== LLM Right Panel ===== */
function LLMPanel({ onGenerate, isGenerating, generationDone, visible, onDismiss }) {
  return (
    <div className={`llm-panel ${visible ? 'visible' : ''}`}>
      <div className="llm-panel-content">
        {onDismiss && (
          <button className="llm-panel-close" onClick={onDismiss} title="Закрыть">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        )}
        <div className="llm-panel-text">
          <h3 className="llm-panel-title">Генерация описания LLM</h3>
          <p className="llm-panel-description">
            Вы можете сгенерировать все описание документа с помощью модели LLM. Это займет несколько минут, после завершения вы сможете принять или поправить предложенный текст.
          </p>
        </div>
        {isGenerating ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <div className="llm-generating-row">
              <Spinner size={24} />
              <span className="generating-text">Идет генерация</span>
            </div>
            <div className="llm-generating-hint">Это займет несколько минут</div>
          </div>
        ) : (
          <button className="llm-panel-btn" onClick={onGenerate}>
            {generationDone ? <CheckmarkIcon size={24} /> : <MagicWandIcon size={24} />}
            <span>{generationDone ? 'Запустить снова' : 'Запустить'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

/* ===== Fields Table ===== */
function FieldsTable({ fields, setFields, missingFields, setMissingFields, onGenerateFields, isGeneratingFields, llmFieldSuggestions, onAcceptFieldSuggestion, onDismissFieldSuggestion }) {
  return (
    <div className="fields-section">
      <div className="fields-header">
        <span className="fields-title">Описание полей</span>
        <AIGenerateLabel text="Сгенерировать описание таблиц" onClick={onGenerateFields} isGenerating={isGeneratingFields} />
      </div>

      {/* Основные поля */}
      <div className="fields-table">
        {fields.map((field, i) => (
          <div key={i} className="field-row">
            <div className="field-name-cell">
              <div className="field-name">{field.name || 'Имя поля'}</div>
              {field.type && <div className="field-type">{field.type}</div>}
            </div>
            <div className="field-desc-cell">
              <textarea
                value={field.description}
                onChange={(e) => {
                  const updated = [...fields]
                  updated[i] = { ...updated[i], description: e.target.value }
                  setFields(updated)
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto'
                    el.style.height = Math.max(el.scrollHeight, 24) + 'px'
                  }
                }}
                placeholder="Заполните поле"
                rows={1}
              />
              {llmFieldSuggestions && llmFieldSuggestions[i] && (
                <div className="llm-field-suggestion">
                  <button className="llm-dismiss-btn" onClick={() => onDismissFieldSuggestion(i)} title="Закрыть">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#949494" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                  <span className="llm-suggestion-text"><span className="llm-suggestion-prefix">LLM:</span> {llmFieldSuggestions[i]}</span>
                  <button className="llm-accept-btn" onClick={() => onAcceptFieldSuggestion(i)}>Принять</button>
                </div>
              )}
              {!field.description && !llmFieldSuggestions?.[i] && <WarningIcon />}
            </div>
            <div className="field-action-cell">
              <TrashIcon active={false} />
            </div>
          </div>
        ))}
      </div>

      {/* Поля которых нет в таблице */}
      {missingFields.length > 0 && (
        <div className="missing-fields">
          <div className="missing-fields-header">
            <div className="missing-fields-title">Поля которых нет в таблице</div>
            <div className="missing-fields-hint">Обратитесь к автору таблицы или удалите их</div>
          </div>
          <div className="fields-table">
            {missingFields.map((field, i) => (
              <div key={i} className="field-row">
                <div className="field-name-cell">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => {
                      const updated = [...missingFields]
                      updated[i] = { ...updated[i], name: e.target.value }
                      setMissingFields(updated)
                    }}
                    placeholder="Имя поля"
                    className="field-input"
                  />
                  <input
                    type="text"
                    value={field.type || ''}
                    onChange={(e) => {
                      const updated = [...missingFields]
                      updated[i] = { ...updated[i], type: e.target.value }
                      setMissingFields(updated)
                    }}
                    placeholder="Тип"
                    className="field-input small"
                  />
                </div>
                <div className="field-desc-cell">
                  <textarea
                    value={field.description}
                    onChange={(e) => {
                      const updated = [...missingFields]
                      updated[i] = { ...updated[i], description: e.target.value }
                      setMissingFields(updated)
                      e.target.style.height = 'auto'
                      e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    ref={(el) => {
                      if (el) {
                        el.style.height = 'auto'
                        el.style.height = el.scrollHeight + 'px'
                      }
                    }}
                    placeholder="Заполните описание"
                    rows={1}
                  />
                  {!field.description && <WarningIcon />}
                </div>
                <div
                  className="field-action-cell clickable"
                  onClick={() => setMissingFields(prev => prev.filter((_, idx) => idx !== i))}
                >
                  <TrashIcon active={true} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Добавить строку */}
      <button
        className="add-field-btn"
        onClick={() => setMissingFields(prev => [...prev, { name: '', type: '', description: '' }])}
      >
        <PlusIcon />
        <span>Добавить строку</span>
      </button>
    </div>
  )
}

/* ===== Registration Page ===== */
function RegistrationPage({ onComplete, onSkipToMain }) {
  const [grade, setGrade] = useState('')
  const [position, setPosition] = useState('')

  const gradeOptions = ['Junior', 'Middle', 'Senior', 'Lead', 'Principal', 'Head']
  const positionOptions = [
    'Data Engineer',
    'Data Analyst',
    'Data Scientist',
    'Backend Developer',
    'Frontend Developer',
    'DevOps Engineer',
    'QA Engineer',
    'Product Manager',
    'Project Manager',
    'Designer',
    'Team Lead',
    'Tech Lead',
    'Аналитик',
    'Разработчик',
    'Тестировщик',
  ]

  const canSubmit = grade && position

  const handleSubmit = () => {
    if (!canSubmit) return
    const participant = {
      id: Date.now(),
      firstName: '',
      lastName: '',
      grade,
      position,
      registeredAt: new Date().toISOString(),
    }
    // Сохраняем в localStorage
    const existing = JSON.parse(localStorage.getItem('research_participants') || '[]')
    existing.push(participant)
    localStorage.setItem('research_participants', JSON.stringify(existing))
    // Сохраняем текущего пользователя
    localStorage.setItem('research_current_user', JSON.stringify(participant))
    // Отправляем в Firebase
    firebasePush('participants', participant).then(fbKey => {
      if (fbKey) {
        participant._firebaseKey = fbKey
        localStorage.setItem('research_current_user', JSON.stringify(participant))
      }
    })
    onComplete(participant)
  }

  return (
    <div className="registration-page">
      <div className="registration-card">
        <div className="registration-logo">
          <img src={`${base}assets/logo.svg`} alt="DataGate" />
        </div>
        <h1 className="registration-title">Добро пожаловать</h1>
        <p className="registration-subtitle">
          Перед началом исследования заполните, пожалуйста, информацию о себе
        </p>

        <div className="registration-form">
          <Dropdown
            label="Грейд"
            placeholder="Выберите грейд"
            options={gradeOptions}
            value={grade}
            onChange={setGrade}
          />

          <Dropdown
            label="Должность"
            placeholder="Выберите должность"
            options={positionOptions}
            value={position}
            onChange={setPosition}
          />
        </div>

        <button
          className={`registration-submit ${canSubmit ? '' : 'disabled'}`}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Начать исследование
        </button>
      </div>

      {/* Секретная кнопка для быстрого входа */}
      {onSkipToMain && (
        <button
          className="admin-ticket-btn"
          onClick={onSkipToMain}
          title="Перейти к созданию документа"
        >
          🎟️
        </button>
      )}

      {/* Невидимая зона в правом верхнем углу — переход на дашборд */}
      <a
        href={`${base}dashboard.html`}
        target="_blank"
        rel="noopener noreferrer"
        className="secret-dash-link"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  )
}

/* ===== Click Map Visualization ===== */
function ClickMapView({ clicks, vpW, vpH, screenshot }) {
  const containerRef = useRef(null)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })

  if (!clicks || clicks.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#949494', fontSize: 14, background: 'var(--color-bg-field)', borderRadius: 12 }}>
        Нет данных о кликах. Пользователь ещё не сохранил документ.
      </div>
    )
  }

  // Координаты кликов записаны относительно main-content (vpW × vpH).
  // Скриншот сделан с scale=0.5, поэтому его натуральные пиксели = vpW*0.5 × vpH*0.5.
  // Показываем скриншот в 100% его натурального размера (ограничено max-width контейнера).
  // Точки позиционируем в процентах от vpW/vpH.

  const handleImgLoad = (e) => {
    setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        position: 'relative',
        display: 'inline-block',
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        maxWidth: '100%',
      }}>
        {screenshot ? (
          <img
            src={screenshot}
            alt="Скриншот интерфейса"
            onLoad={handleImgLoad}
            style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
          />
        ) : (
          <div style={{
            width: 680,
            height: Math.round(680 * (vpH || 900) / (vpW || 1440)),
            background: '#f4f4f5',
          }} />
        )}
        {/* Точки кликов поверх скриншота в процентах */}
        {clicks.map((click, i) => {
          const leftPct = ((click.x / (vpW || 1)) * 100)
          const topPct = ((click.y / (vpH || 1)) * 100)
          const t = clicks.length > 1 ? i / (clicks.length - 1) : 0
          const r = Math.round(131 + (249 - 131) * t)
          const g = Math.round(93 + (142 - 93) * t * 0.5)
          const b = Math.round(225 + (136 - 225) * t)
          return (
            <div
              key={i}
              title={`#${i+1}: ${click.element} — ${click.text}`}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: 'translate(-50%, -50%)',
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: `rgb(${r},${g},${b})`,
                border: '2px solid rgba(255,255,255,0.9)',
                boxShadow: `0 0 6px rgba(${r},${g},${b},0.5)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                fontWeight: 700,
                color: '#fff',
                cursor: 'default',
                zIndex: 2,
                pointerEvents: 'auto',
              }}
            >
              {i < 99 ? i + 1 : ''}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--color-secondary)' }}>
        <span>🖱 Кликов: <b style={{ color: 'var(--color-primary)' }}>{clicks.length}</b></span>
        <span>⏱ Сессия: <b style={{ color: 'var(--color-primary)' }}>{clicks.length > 0 ? Math.round(clicks[clicks.length - 1].ts / 1000) : 0} сек</b></span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgb(131,93,225)', display: 'inline-block' }} /> Начало
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgb(249,142,136)', display: 'inline-block', marginLeft: 8 }} /> Конец
        </span>
      </div>
      {/* Список последних кликов */}
      <details style={{ fontSize: 13 }}>
        <summary style={{ cursor: 'pointer', color: 'var(--color-brand)', fontWeight: 500, padding: '4px 0' }}>
          Показать список кликов ({clicks.length})
        </summary>
        <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8, background: 'var(--color-bg-field)', borderRadius: 8, padding: '8px 12px' }}>
          {clicks.map((c, i) => (
            <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 12, fontSize: 12, color: 'var(--color-secondary)' }}>
              <span style={{ width: 24, fontWeight: 600, color: 'var(--color-primary)' }}>#{i+1}</span>
              <span style={{ width: 80 }}>{(c.ts / 1000).toFixed(1)}s</span>
              <span style={{ width: 100 }}>({c.x}, {c.y})</span>
              <span style={{ flex: 1, color: 'var(--color-primary)' }}>{c.element}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.text}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

/* ===== Survey Questions (нужно ДО AdminPage, т.к. используется в нём) ===== */
const surveyQuestions = [
  {
    id: 'ease_of_use',
    text: 'Насколько легко было создать документ?',
    type: 'scale',
    scaleMin: 1,
    scaleMax: 7,
    scaleLabels: ['Очень сложно', 'Очень легко'],
  },
  {
    id: 'ai_attitude',
    text: 'Как вы относитесь к генерации описания с помощью ИИ?',
    type: 'choice',
    options: [
      'Положительно — это ускоряет работу',
      'Нейтрально — зависит от качества',
      'Скептически — предпочитаю писать сам(а)',
      'Отрицательно — не доверяю ИИ',
    ],
  },
  {
    id: 'llm_usage',
    text: 'Используете генерацию контента от LLM в настоящей работе?',
    type: 'choice',
    options: [
      'Да, регулярно',
      'Иногда, для отдельных задач',
      'Редко, пробовал(а) пару раз',
      'Нет, не использую',
    ],
  },
  {
    id: 'improvements',
    text: 'Что бы вы улучшили в кейсе создания документа?',
    type: 'text',
  },
  {
    id: 'unclear',
    text: 'Что было непонятно при создании документа?',
    type: 'text',
  },
]

/* ===== Admin Page ===== */
function AdminPage({ onBack }) {
  const [participants, setParticipants] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Загружаем из Firebase (централизованное хранилище)
    firebaseFetchAll('participants').then(fbData => {
      if (fbData.length > 0) {
        setParticipants(fbData)
      } else {
        // Fallback на localStorage
        const data = JSON.parse(localStorage.getItem('research_participants') || '[]')
        setParticipants(data)
      }
      setLoading(false)
    })
  }, [])

  const clearAll = () => {
    if (confirm('Удалить все записи участников?')) {
      localStorage.removeItem('research_participants')
      localStorage.removeItem('research_sessions')
      setParticipants([])
    }
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="layout">
      <Sidebar onIdeaClick={onBack} currentPage="admin" />
      <div className="main-area">
        <main className="main-content">
          <div className="navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="admin-back-btn" onClick={onBack} title="Назад">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12 5l-5 5 5 5" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="navbar-title">Участники исследования</h1>
            </div>
          </div>

          <div className="form-container">
            <div className="admin-header">
              <span className="admin-count">Всего: {participants.length}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {participants.length > 0 && (
                  <button className="admin-clear-btn" style={{ background: 'var(--color-brand)', color: '#fff', border: 'none' }} onClick={() => exportParticipantsCSV(participants)}>
                    📥 Скачать CSV
                  </button>
                )}
                {participants.length > 0 && (
                  <button className="admin-clear-btn" onClick={clearAll}>
                    Очистить всё
                  </button>
                )}
              </div>
            </div>

            {participants.length === 0 ? (
              <div className="admin-empty">
                <p>Пока нет зарегистрированных участников</p>
              </div>
            ) : (
              <div className="admin-table">
                <div className="admin-table-header">
                  <span className="admin-col admin-col-num">№</span>
                  <span className="admin-col admin-col-name">Имя Фамилия</span>
                  <span className="admin-col admin-col-grade">Грейд</span>
                  <span className="admin-col admin-col-position">Должность</span>
                  <span className="admin-col admin-col-date">Дата</span>
                </div>
                {participants.map((p, i) => (
                  <div key={p.id}>
                    <div
                      className="admin-table-row"
                      style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => toggleExpand(p.id)}
                      title="Нажмите, чтобы увидеть карту кликов"
                    >
                      <span className="admin-col admin-col-num">{i + 1}</span>
                      <span className="admin-col admin-col-name">
                        Испытуемый #{i + 1}
                        {p.clickMap && p.clickMap.length > 0 && (
                          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--color-brand)', fontWeight: 500 }}>
                            🖱 {p.totalClicks || p.clickMap.length}
                          </span>
                        )}
                      </span>
                      <span className="admin-col admin-col-grade">
                        <span className="admin-grade-badge">{p.grade}</span>
                      </span>
                      <span className="admin-col admin-col-position">{p.position}</span>
                      <span className="admin-col admin-col-date">
                        {formatDate(p.registeredAt)}
                        <span style={{ marginLeft: 8, fontSize: 14 }}>
                          {expandedId === p.id ? '▲' : '▼'}
                        </span>
                      </span>
                    </div>
                    {expandedId === p.id && (
                      <div style={{
                        background: 'var(--color-white)',
                        padding: '20px 16px',
                        borderRadius: '0 0 12px 12px',
                        marginTop: -1,
                        borderTop: '2px solid var(--color-brand)',
                      }}>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--color-primary)' }}>
                          Карта кликов — {p.firstName} {p.lastName}
                        </div>
                        <ClickMapView
                          clicks={p.clickMap}
                          vpW={p.clickMap?.[0]?.vpW}
                          vpH={p.clickMap?.[0]?.vpH}
                          screenshot={p.screenshot}
                        />

                        {/* Ответы опросника */}
                        {p.surveyAnswers && (
                          <div className="admin-survey-answers">
                            <div className="admin-survey-title">
                              📋 Ответы опросника
                              {p.surveyCompletedAt && (
                                <span className="admin-survey-date">{formatDate(p.surveyCompletedAt)}</span>
                              )}
                            </div>
                            <div className="admin-survey-grid">
                              {surveyQuestions.map((q) => {
                                const answer = p.surveyAnswers[q.id]
                                if (!answer) return null
                                return (
                                  <div key={q.id} className="admin-survey-item">
                                    <div className="admin-survey-q">{q.text}</div>
                                    <div className={`admin-survey-a ${q.type === 'scale' ? 'scale' : ''}`}>
                                      {q.type === 'scale' ? (
                                        <span className="admin-survey-scale-value">{answer}<span className="admin-survey-scale-max">/{q.scaleMax}</span></span>
                                      ) : (
                                        answer
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {!p.surveyAnswers && (
                          <div className="admin-survey-empty">Опросник не пройден</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

/* ===== Survey Modal (Опросник после сохранения) ===== */
function SurveyModal({ onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const question = surveyQuestions[step]
  const totalSteps = surveyQuestions.length
  const isLast = step === totalSteps - 1

  const currentAnswer = answers[question.id] || ''
  const canProceed = currentAnswer.trim().length > 0

  const handleNext = () => {
    if (!canProceed) return
    if (isLast) {
      onComplete(answers)
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const setAnswer = (val) => {
    setAnswers(prev => ({ ...prev, [question.id]: val }))
  }

  return (
    <div className="survey-overlay">
      <div className="survey-modal">
        <div className="survey-header">
          <div className="survey-step-indicator">
            {surveyQuestions.map((_, i) => (
              <div key={i} className={`survey-step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
            ))}
          </div>
          <div className="survey-step-label">Шаг {step + 1} из {totalSteps}</div>
        </div>

        <div className="survey-body">
          <h2 className="survey-question">{question.text}</h2>

          {question.type === 'choice' && (
            <div className="survey-choices">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  className={`survey-choice ${currentAnswer === opt ? 'selected' : ''}`}
                  onClick={() => setAnswer(opt)}
                >
                  <span className="survey-radio">{currentAnswer === opt ? '●' : '○'}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          )}

          {question.type === 'scale' && (
            <div className="survey-scale">
              <div className="survey-scale-labels">
                <span>{question.scaleLabels?.[0]}</span>
                <span>{question.scaleLabels?.[1]}</span>
              </div>
              <div className="survey-scale-buttons">
                {Array.from({ length: question.scaleMax - question.scaleMin + 1 }, (_, i) => {
                  const val = String(question.scaleMin + i)
                  return (
                    <button
                      key={val}
                      className={`survey-scale-btn ${currentAnswer === val ? 'selected' : ''}`}
                      onClick={() => setAnswer(val)}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              className="survey-textarea"
              value={currentAnswer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Напишите ваш ответ..."
              rows={4}
            />
          )}
        </div>

        <div className="survey-footer">
          {step > 0 && (
            <button className="survey-btn survey-btn-back" onClick={handleBack}>
              Назад
            </button>
          )}
          <button
            className={`survey-btn survey-btn-next ${!canProceed ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={!canProceed}
          >
            {isLast ? 'Завершить' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ===== Thank You Modal ===== */
function ThankYouModal({ onClose }) {
  const [copiedNick, setCopiedNick] = useState(null)

  const copyNick = (nick) => {
    navigator.clipboard.writeText(nick).then(() => {
      setCopiedNick(nick)
      setTimeout(() => setCopiedNick(null), 1500)
    })
  }

  return (
    <div className="survey-overlay">
      <div className="thankyou-modal">
        <div className="thankyou-image-section">
          <img
            src={`${import.meta.env.BASE_URL}assets/character-thank-you.png`}
            alt="Улучшаем DataGate вместе"
            className="thankyou-character"
          />
        </div>
        <div className="thankyou-content">
          <div className="thankyou-title-row">
            <h2 className="thankyou-title">Улучшаем DataGate вместе!</h2>
          </div>
          <div className="thankyou-text-row">
            <p className="thankyou-text">
              Спасибо за вклад в процесс тестирования новых идей! Благодаря тебе мы станем чуточку лучше.
              <br /><br />
              Если есть идеи или мысли по поводу того, как сделать сервис лучше, можешь написать{' '}
              <span className="thankyou-mention clickable" onClick={() => copyNick('@tevs')} title="Скопировать">
                @tevs{copiedNick === '@tevs' && <span className="copied-tooltip">Скопировано!</span>}
              </span> или{' '}
              <span className="thankyou-mention clickable" onClick={() => copyNick('@varaxin')} title="Скопировать">
                @varaxin{copiedNick === '@varaxin' && <span className="copied-tooltip">Скопировано!</span>}
              </span> в Конект.
            </p>
          </div>
        </div>
        <div className="thankyou-footer">
          <button className="thankyou-close-btn" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}

/* ===== Click Tracker ===== */
function useClickTracker() {
  const clicksRef = useRef([])
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    startTimeRef.current = Date.now()

    const handleClick = (e) => {
      const target = e.target.closest('button, a, input, textarea, select, [role="button"], .dropdown-trigger, .tag-chip, .storage-chip, .sidebar-item, .switch-toggle, .admin-ticket-btn')
      // Координаты относительно .main-area для точного наложения на скриншот
      const scrollContainer = document.querySelector('.main-area')
      const mainContent = document.querySelector('.main-content')
      let relX = e.clientX
      let relY = e.clientY
      let contentW = window.innerWidth
      let contentH = window.innerHeight
      if (scrollContainer) {
        const scrollRect = scrollContainer.getBoundingClientRect()
        relX = Math.max(0, e.clientX - scrollRect.left)
        relY = Math.max(0, e.clientY - scrollRect.top + scrollContainer.scrollTop)
        contentW = scrollContainer.clientWidth
        contentH = scrollContainer.scrollHeight
      }
      const click = {
        x: relX,
        y: relY,
        vpW: contentW,
        vpH: contentH,
        ts: Date.now() - startTimeRef.current,
        tag: e.target.tagName.toLowerCase(),
        element: target ? (target.className?.split?.(' ')?.[0] || target.tagName.toLowerCase()) : e.target.tagName.toLowerCase(),
        text: (target?.textContent || e.target.textContent || '').slice(0, 50).trim(),
      }
      clicksRef.current.push(click)
    }

    document.addEventListener('pointerdown', handleClick, true)
    return () => document.removeEventListener('pointerdown', handleClick, true)
  }, [])

  const getClicks = () => [...clicksRef.current]
  const resetClicks = () => { clicksRef.current = []; startTimeRef.current = Date.now() }

  return { getClicks, resetClicks }
}

/* ===== Main App ===== */
export default function App() {
  const [page, setPage] = useState(() => {
    const user = localStorage.getItem('research_current_user')
    return user ? 'main' : 'registration'
  })
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('research_current_user')
    return user ? JSON.parse(user) : null
  })
  const { getClicks, resetClicks } = useClickTracker()

  const handleRegistrationComplete = (participant) => {
    setCurrentUser(participant)
    setPage('main')
  }

  const handleGoToAdmin = () => {
    setPage('admin')
  }

  const handleBackToMain = () => {
    // Если пользователь не зарегистрирован, возвращаем на регистрацию
    setPage(currentUser ? 'main' : 'registration')
  }

  if (page === 'registration') {
    return <RegistrationPage onComplete={handleRegistrationComplete} onSkipToMain={() => setPage('main')} />
  }

  if (page === 'admin') {
    return <AdminPage onBack={handleBackToMain} />
  }

  const handleLogoClick = () => {
    localStorage.removeItem('research_current_user')
    setCurrentUser(null)
    setPage('registration')
  }

  return <MainPage currentUser={currentUser} onGoToAdmin={handleGoToAdmin} onLogoClick={handleLogoClick} getClicks={getClicks} resetClicks={resetClicks} />
}

/* ===== Main Page (extracted) ===== */
function MainPage({ currentUser, onGoToAdmin, onLogoClick, getClicks, resetClicks }) {
  const [owner, setOwner] = useState('')
  const [storageEnabled, setStorageEnabled] = useState(true)
  const [storageType, setStorageType] = useState('DWH')
  const [database, setDatabase] = useState('')
  const [schema, setSchema] = useState('')
  const [table, setTable] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [isGeneratingFields, setIsGeneratingFields] = useState(false)
  const [fields, setFields] = useState([
    { name: 'id', type: 'bigint', description: 'PK', inTable: true },
    { name: 'created_at', type: 'timestamp without time zone', description: '', inTable: true },
  ])
  const [missingFields, setMissingFields] = useState([])
  const [showSurvey, setShowSurvey] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [savedClicksCount, setSavedClicksCount] = useState(0)
  const [savedSessionDuration, setSavedSessionDuration] = useState(0)

  // Каскадный сброс
  const handleDatabaseChange = (val) => {
    setDatabase(val)
    setSchema('')
    setTable('')
  }

  const handleSchemaChange = (val) => {
    setSchema(val)
    setTable('')
  }

  // Генерация описания ИИ — текст появляется целиком после завершения как LLM-предложение
  const [llmDescSuggestion, setLlmDescSuggestion] = useState(null)
  const [llmFieldSuggestions, setLlmFieldSuggestions] = useState({})

  const generateAIDescription = () => {
    if (isGenerating || !canGenerate) return
    setIsGenerating(true)
    const tableName = table || 'таблица'
    const dbName = database || 'база данных'
    const schemaName = schema || 'схема'
    const fieldNames = fields.filter(f => f.name).map(f => f.name).join(', ')

    const descriptions = [
      `Таблица ${tableName} в ${dbName}.${schemaName} содержит данные, необходимые для аналитической отчётности и формирования ключевых бизнес-метрик. Поля: ${fieldNames || 'не указаны'}. Данные обновляются ежедневно в рамках ETL-процесса и используются смежными командами для построения дашбордов и ad-hoc анализа.`,
      `Данная таблица (${tableName}) является частью схемы ${schemaName} в ${dbName} и служит источником данных для расчёта операционных показателей. Содержит информацию, структурированную по полям: ${fieldNames || 'не указаны'}. Рекомендуется для использования в витринах данных и BI-отчётах.`,
      `${tableName} — таблица хранилища ${dbName}, схема ${schemaName}. Предназначена для хранения и агрегации бизнес-данных. Основные поля: ${fieldNames || 'не указаны'}. Используется в процессах Data Engineering для обеспечения консистентности данных между слоями хранилища.`,
    ]

    const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)]
    // Имитация задержки LLM — текст появляется целиком
    setTimeout(() => {
      setLlmDescSuggestion(randomDesc)
      setIsGenerating(false)
    }, 10000)
  }

  const acceptDescSuggestion = () => {
    if (llmDescSuggestion) {
      setDescription(llmDescSuggestion)
      setLlmDescSuggestion(null)
      aiStatsRef.current.descAccepted++
    }
  }

  const [generationDone, setGenerationDone] = useState(false)

  // Когда generateAll запущен и обе генерации завершились — показываем галочку
  useEffect(() => {
    if (isGeneratingAll && !isGenerating && !isGeneratingFields) {
      setIsGeneratingAll(false)
      setGenerationDone(true)
    }
  }, [isGeneratingAll, isGenerating, isGeneratingFields])

  // Генерация всего через LLM
  // Спиннер крутится пока ВСЕ предложения не сгенерируются, галочка появляется после
  const generateAll = () => {
    if (isGeneratingAll || !canGenerate) return
    setIsGeneratingAll(true)
    setGenerationDone(false)
    generateAIDescription()
    setTimeout(() => {
      generateFieldDescriptions()
    }, 500)
  }

  // Генерация описаний полей ИИ — текст появляется целиком как LLM-предложение
  const generateFieldDescriptions = () => {
    if (isGeneratingFields || !canGenerate) return
    setIsGeneratingFields(true)
    const fieldDescs = [
      'Уникальный идентификатор записи в таблице, автоинкрементный первичный ключ',
      'Дата и время создания записи в формате UTC, заполняется автоматически при INSERT',
      'Код статуса обработки записи в рамках ETL-пайплайна',
      'Ссылка на внешний идентификатор в системе-источнике',
    ]
    // Все предложения появляются одновременно после задержки
    setTimeout(() => {
      const suggestions = {}
      fields.forEach((field, idx) => {
        if (!field.description || field.description === 'PK') {
          suggestions[idx] = fieldDescs[idx] || `Описание поля ${field.name}`
        }
      })
      setLlmFieldSuggestions(suggestions)
      setIsGeneratingFields(false)
    }, 12500)
  }

  const acceptFieldSuggestion = (idx) => {
    if (llmFieldSuggestions[idx]) {
      setFields(prev => {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], description: llmFieldSuggestions[idx] }
        return updated
      })
      setLlmFieldSuggestions(prev => {
        const updated = { ...prev }
        delete updated[idx]
        return updated
      })
      aiStatsRef.current.fieldsAccepted++
    }
  }

  const handleSave = async () => {
    // Собираем карту кликов и прикладываем к данным участника
    const clicks = getClicks ? getClicks() : []

    // Делаем скриншот интерфейса
    let screenshotBase64 = null
    try {
      const mainContentEl = document.querySelector('.main-content')
      const scrollEl = document.querySelector('.main-area')
      if (mainContentEl && scrollEl) {
        // Прокручиваем наверх чтобы html2canvas захватил весь контент корректно
        const savedScroll = scrollEl.scrollTop
        scrollEl.scrollTop = 0
        // Небольшая задержка чтобы браузер отрисовал
        await new Promise(r => setTimeout(r, 100))
        const canvas = await html2canvas(mainContentEl, {
          scale: 1, // 1:1 чтобы пиксели скриншота совпадали с координатами кликов
          useCORS: true,
          logging: false,
          backgroundColor: '#f4f4f5',
          height: mainContentEl.scrollHeight,
          windowHeight: mainContentEl.scrollHeight,
        })
        scrollEl.scrollTop = savedScroll
        screenshotBase64 = canvas.toDataURL('image/jpeg', 0.4)
      }
    } catch (err) {
      console.warn('Не удалось сделать скриншот:', err)
    }

    const sessionData = {
      user: currentUser,
      savedAt: new Date().toISOString(),
      clickMap: clicks,
      totalClicks: clicks.length,
      sessionDuration: clicks.length > 0 ? clicks[clicks.length - 1].ts : 0,
      screenshot: screenshotBase64,
      formData: {
        owner,
        storageEnabled,
        storageType,
        database,
        schema,
        table,
        description: description.slice(0, 200) + (description.length > 200 ? '...' : ''),
        tags,
        fieldsCount: fields.length,
        missingFieldsCount: missingFields.length,
      },
    }
    // Сохраняем сессию в localStorage
    const sessions = JSON.parse(localStorage.getItem('research_sessions') || '[]')
    sessions.push(sessionData)
    localStorage.setItem('research_sessions', JSON.stringify(sessions))

    // Также обновляем данные участника с кликами и скриншотом
    if (currentUser) {
      const participants = JSON.parse(localStorage.getItem('research_participants') || '[]')
      const idx = participants.findIndex(p => p.id === currentUser.id)
      if (idx !== -1) {
        participants[idx].clickMap = clicks
        participants[idx].totalClicks = clicks.length
        participants[idx].sessionDuration = clicks.length > 0 ? clicks[clicks.length - 1].ts : 0
        participants[idx].screenshot = screenshotBase64
        localStorage.setItem('research_participants', JSON.stringify(participants))
      }
    }

    // Отправляем в Firebase (без скриншота — он слишком большой)
    if (currentUser?._firebaseKey) {
      firebaseUpdate(`participants/${currentUser._firebaseKey}`, {
        clickMap: clicks,
        totalClicks: clicks.length,
        sessionDuration: clicks.length > 0 ? clicks[clicks.length - 1].ts : 0,
        formData: sessionData.formData,
        savedAt: sessionData.savedAt,
        aiDescStats: { ...aiStatsRef.current },
      })
    }

    if (resetClicks) resetClicks()
    setSavedClicksCount(clicks.length)
    setSavedSessionDuration(clicks.length > 0 ? Math.round(clicks[clicks.length - 1].ts / 1000) : 0)
    setShowSurvey(true)
  }

  const handleSurveyComplete = (answers) => {
    // Сохраняем ответы опросника к участнику
    if (currentUser) {
      const participants = JSON.parse(localStorage.getItem('research_participants') || '[]')
      const idx = participants.findIndex(p => p.id === currentUser.id)
      if (idx !== -1) {
        participants[idx].surveyAnswers = answers
        participants[idx].surveyCompletedAt = new Date().toISOString()
        localStorage.setItem('research_participants', JSON.stringify(participants))
      }
    }
    // Обновляем в Firebase
    if (currentUser?._firebaseKey) {
      firebaseUpdate(`participants/${currentUser._firebaseKey}`, {
        surveyAnswers: answers,
        surveyCompletedAt: new Date().toISOString(),
      })
    }
    setShowSurvey(false)
    setShowThankYou(true)
  }

  // AI description tracking
  const aiStatsRef = useRef({ descAccepted: 0, descDismissed: 0, fieldsAccepted: 0, fieldsDismissed: 0 })

  const [llmDismissed, setLlmDismissed] = useState(false)

  const handleDismissLLM = () => {
    setLlmDismissed(true)
    // Отправляем событие в Firebase
    if (currentUser?._firebaseKey) {
      firebaseUpdate(`participants/${currentUser._firebaseKey}`, {
        llmBannerDismissed: true,
        llmBannerDismissedAt: new Date().toISOString(),
      })
    }
  }

  const canGenerate = storageEnabled && database && schema && table
  const showLLMPanel = canGenerate && !llmDismissed

  return (
    <div className="layout">
      <Sidebar onIdeaClick={onGoToAdmin} onLogoClick={onLogoClick} onLogout={onLogoClick} userName={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : undefined} />
      <div className="main-area">
        <main className="main-content">
          <div className="navbar">
            <div className="navbar-tabs">
              <button className="navbar-tab active">Ввод нового</button>
              <button className="navbar-tab">Поиск</button>
              <button className="navbar-tab">Витрины</button>
            </div>
            <a href={`${import.meta.env.BASE_URL}dashboard.html`} target="_blank" rel="noopener noreferrer" className="secret-dash-link" aria-hidden="true" tabIndex={-1} />
          </div>

          <div className="form-container">
            {/* Круги-владельцы */}
            <Dropdown
              label="Круги-владельцы"
              placeholder="Выберите любой круг"
              options={ownerOptions}
              value={owner}
              onChange={setOwner}
            />

            {/* Хранилище */}
            <Switch
              title="Хранилище"
              description="Для активного документа выбор хранилища обязателен"
              checked={storageEnabled}
              onChange={setStorageEnabled}
            />

            {storageEnabled && (
              <>
                <StorageChips value={storageType} onChange={setStorageType} />

                <Dropdown
                  label="База данных"
                  placeholder="Выберите базу данных"
                  options={databaseOptions}
                  value={database}
                  onChange={handleDatabaseChange}
                />

                <Dropdown
                  label="Схема"
                  placeholder="Выберите схему"
                  options={database ? (schemaOptions[database] || []) : []}
                  value={schema}
                  onChange={handleSchemaChange}
                  disabled={!database}
                />

                <Dropdown
                  label="Таблица"
                  placeholder="Выберите таблицу"
                  options={schema ? (tableOptions[schema] || []) : []}
                  value={table}
                  onChange={setTable}
                  disabled={!schema}
                />
              </>
            )}

            {/* Описание таблицы */}
            <div className="section-header">
              <span className="section-title">Описание таблицы</span>
              <AIGenerateLabel text="Сгенерировать общее описание" onClick={generateAIDescription} isGenerating={isGenerating} disabled={!canGenerate} />
            </div>
            <TextEditor
              value={description}
              onChange={setDescription}
              placeholder="Введите описание документа..."
              isGenerating={isGenerating}
              onGenerate={generateAIDescription}
              disableGenerate={!canGenerate}
              llmSuggestion={llmDescSuggestion}
              onAcceptSuggestion={acceptDescSuggestion}
              onDismissSuggestion={() => { setLlmDescSuggestion(null); aiStatsRef.current.descDismissed++ }}
            />

            {/* Contextual Notification */}
            <ContextualNotification
              title="Попробуйте ИИ-генерацию"
              text="Заполните основные поля и нажмите «Сгенерировать» — ИИ подготовит описание за вас."
              visible={canGenerate && !llmDismissed}
              onDismiss={() => setLlmDismissed(true)}
            />

            {/* Теги */}
            <TagsInput tags={tags} setTags={setTags} owner={owner} />

            {/* Таблица полей — только если выбрана таблица */}
            {table && (
              <FieldsTable
                fields={fields}
                setFields={setFields}
                missingFields={missingFields}
                setMissingFields={setMissingFields}
                onGenerateFields={generateFieldDescriptions}
                isGeneratingFields={isGeneratingFields}
                llmFieldSuggestions={llmFieldSuggestions}
                onAcceptFieldSuggestion={acceptFieldSuggestion}
                onDismissFieldSuggestion={(idx) => {
                  setLlmFieldSuggestions(prev => {
                    const updated = { ...prev }
                    delete updated[idx]
                    return updated
                  })
                  aiStatsRef.current.fieldsDismissed++
                }}
              />
            )}

            <div className="footer">
              <button className="footer-btn secondary">Отменить</button>
              <button className="footer-btn primary" onClick={handleSave}>
                Сохранить
              </button>
            </div>
          </div>
        </main>

        {/* Правая панель LLM — плавно появляется после заполнения хранилища */}
        <LLMPanel onGenerate={generateAll} isGenerating={isGeneratingAll} generationDone={generationDone} visible={showLLMPanel} onDismiss={handleDismissLLM} />
      </div>

      {/* Опросник после сохранения */}
      {showSurvey && <SurveyModal onComplete={handleSurveyComplete} />}

      {/* Модалка благодарности */}
      {showThankYou && <ThankYouModal onClose={() => setShowThankYou(false)} />}
    </div>
  )
}
