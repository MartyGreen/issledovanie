import { useState, useRef, useEffect } from 'react'
import './index.css'

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
  'Круг Data Engineering',
  'Круг Data Analytics',
  'Круг Data Science',
  'Круг Platform',
  'Круг Backend',
  'Круг Frontend',
  'Круг DevOps',
  'Круг Security',
  'Круг Product',
  'Круг QA',
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
  'Круг Data Engineering': ['ETL', 'DWH', 'Pipeline', 'Airflow', 'Data Quality', 'Spark'],
  'Круг Data Analytics': ['BI', 'Дашборд', 'Метрики', 'A/B тест', 'Когорты', 'Отчётность'],
  'Круг Data Science': ['ML', 'Модель', 'Фичи', 'Прогноз', 'NLP', 'Рекомендации'],
  'Круг Platform': ['Инфраструктура', 'Kubernetes', 'CI/CD', 'Мониторинг', 'SLA'],
  'Круг Backend': ['API', 'Микросервис', 'БД', 'Кэш', 'Очереди', 'REST'],
  'Круг Frontend': ['UI', 'Компонент', 'Дизайн-система', 'SPA', 'Роутинг'],
  'Круг DevOps': ['Deploy', 'Docker', 'Terraform', 'Логи', 'Алерты'],
  'Круг Security': ['Безопасность', 'Аутентификация', 'Шифрование', 'Аудит'],
  'Круг Product': ['Продукт', 'Фича', 'Roadmap', 'OKR', 'Гипотеза'],
  'Круг QA': ['Тестирование', 'Автотест', 'Регресс', 'Баг', 'Покрытие'],
}

const defaultPopularTags = ['ORACLE', 'DOCUMENT', 'ЭДО', 'Документооборот', 'ЭПД', 'DWH', 'ETL', 'Метрики']

/* ===== Sidebar ===== */
const mainMenuItems = [
  { icon: '/assets/icon-document-book.svg', label: 'Документация', active: true, badge: 5 },
  { icon: '/assets/icon-person.svg', label: 'Команда' },
  { icon: '/assets/icon-integration.svg', label: 'Сессия' },
  { icon: '/assets/icon-file.svg', label: 'Загрузчик файлов' },
  { icon: '/assets/icon-check-circle.svg', label: 'Bi-API методы' },
  { icon: '/assets/icon-upload-arrow.svg', label: 'Управление загрузками' },
  { icon: '/assets/icon-pencil.svg', label: 'Редактор SQL' },
]

const mapItem = { icon: '/assets/icon-layout-grid.svg', label: 'Карта сервисов' }

const bottomItems = [
  { icon: '/assets/icon-document-book-2.svg', label: 'Есть идея' },
  { icon: '/assets/icon-help-circle.svg', label: 'Нужна помощь' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top-bar">
        <span className="sidebar-top-bar-company">ООО "Банк Точка"</span>
        <span className="sidebar-top-bar-release">
          последний релиз: <span>02.11.2026</span>
        </span>
      </div>

      <div className="sidebar-logo">
        <img src="/assets/logo.svg" alt="DataGate" />
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-menu-group">
          {mainMenuItems.map((item) => (
            <button
              key={item.label}
              className={`sidebar-item ${item.active ? 'active' : ''}`}
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
              <button key={item.label} className="sidebar-item">
                <img src={item.icon} alt="" className="sidebar-item-icon" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <button className="sidebar-user">
            <div className="sidebar-avatar">
              <img src="/assets/avatar-cat.jpg" alt="Avatar" />
            </div>
            <span className="sidebar-user-name">Никита Сокол</span>
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
          <div className="toolbar-divider" />
          <button
            className={`toolbar-ai-btn ${isGenerating ? 'generating' : ''} ${disableGenerate ? 'disabled' : ''}`}
            onClick={onGenerate}
            disabled={isGenerating || disableGenerate}
            title="Сгенерировать с ИИ"
          >
            <SparkleIcon />
            <span>{isGenerating ? 'Генерация...' : 'Сгенерировать ИИ'}</span>
          </button>
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

/* ===== LLM Right Panel ===== */
function LLMPanel({ onGenerate, isGenerating, generationDone, visible }) {
  return (
    <div className={`llm-panel ${visible ? 'visible' : ''}`}>
      <div className="llm-panel-content">
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

/* ===== Main App ===== */
export default function App() {
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
    }, 2000)
  }

  const acceptDescSuggestion = () => {
    if (llmDescSuggestion) {
      setDescription(llmDescSuggestion)
      setLlmDescSuggestion(null)
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
    }, 2500)
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
    }
  }

  const handleSave = () => {
    alert('Документ сохранён! (демо)')
  }

  const canGenerate = storageEnabled && database && schema && table
  const showLLMPanel = canGenerate

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-area">
        <main className="main-content">
          <div className="navbar">
            <h1 className="navbar-title">Новый документ</h1>
          </div>

          <div className="form-container">
            {/* Круги-владельцы */}
            <Dropdown
              label="Круги-владельцы"
              placeholder="Выберите круг"
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
              onDismissSuggestion={() => setLlmDescSuggestion(null)}
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
                }}
              />
            )}

            <div className="footer">
              <button className="save-button" onClick={handleSave}>
                Сохранить
              </button>
            </div>
          </div>
        </main>

        {/* Правая панель LLM — плавно появляется после заполнения хранилища */}
        <LLMPanel onGenerate={generateAll} isGenerating={isGeneratingAll} generationDone={generationDone} visible={showLLMPanel} />
      </div>
    </div>
  )
}
