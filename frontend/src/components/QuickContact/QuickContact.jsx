import { useState, useEffect } from 'react'
import { MapPin, Mail, MessageCircle, Headphones, ChevronDown } from 'lucide-react'
import { homePageApi } from '../../services/api'
import styles from './QuickContact.module.scss'

import zaloIconImg from '../../assets/contact/zalo.png'
import phoneIconImg from '../../assets/contact/phone.png'
import messengerIconImg from '../../assets/contact/messenger.png'

function MapIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function renderItemIcon(item) {
  const type = item.type || item.id
  switch (type) {
    case 'zalo':
      return <img src={zaloIconImg} alt="Zalo" className={styles.iconZaloImg} />
    case 'messenger':
      return <img src={messengerIconImg} alt="Messenger" className={styles.iconMessengerImg} />
    case 'phone':
      return <img src={phoneIconImg} alt="Hotline" className={styles.iconPhoneImg} />
    case 'map':
      return <MapIcon className={styles.iconMapSvg} />
    case 'mail':
    case 'email':
      return <Mail className={styles.iconLucide} size={20} strokeWidth={2.1} />
    default:
      return <MessageCircle className={styles.iconLucide} size={20} strokeWidth={2.1} />
  }
}

export default function QuickContact() {
  const [config, setConfig] = useState(null)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    let cancelled = false
    homePageApi.get()
      .then((res) => {
        if (!cancelled && res.data?.quick_contact) {
          setConfig(res.data.quick_contact)
        }
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [])

  if (!config || config.enabled === false) return null

  const items = Array.isArray(config.items) ? config.items.filter(item => item.active !== false) : []
  if (!items.length) return null

  const positionClass = config.position === 'left' ? styles.posLeft : styles.posRight
  const isPulse = config.pulse_animation !== false

  return (
    <aside
      className={`${styles.widgetWrap} ${positionClass} ${isExpanded ? styles.isExpanded : styles.isCollapsed}`}
      aria-label="Kênh liên hệ nhanh"
    >
      {/* Nút toggle thu nhỏ / mở rộng */}
      <button
        type="button"
        className={styles.toggleBtn}
        onClick={() => setIsExpanded(prev => !prev)}
        title={isExpanded ? 'Thu nhỏ liên hệ' : 'Mở kênh liên hệ'}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown size={16} className={styles.toggleIcon} />
        ) : (
          <div className={styles.collapsedBadgeWrap}>
            <Headphones size={18} className={styles.collapsedIcon} />
          </div>
        )}
      </button>

      {/* Danh sách các nút liên hệ */}
      <div className={styles.itemsList}>
        {items.map((item, idx) => {
          const isPhone = item.type === 'phone'
          const href = isPhone
            ? `tel:${String(item.value).replace(/[^\d+]/g, '')}`
            : item.value

          const target = isPhone ? '_self' : '_blank'
          const rel = isPhone ? undefined : 'noopener noreferrer'
          const itemColor = item.color || '#b91c1c'

          return (
            <div key={item.id || idx} className={styles.itemRow}>
              {/* Tooltip chữ rõ ràng, KHÔNG shadow mờ chữ */}
              <a
                href={href}
                target={target}
                rel={rel}
                className={styles.tooltipLabel}
                style={{ '--item-accent': itemColor }}
              >
                <span className={styles.labelMain}>{item.label}</span>
                {item.sublabel && <span className={styles.labelSub}>{item.sublabel}</span>}
              </a>

              {/* Khung nút bao gồm vòng aura tỏa nhẹ theo màu icon */}
              <div className={styles.btnWrap}>
                {isPulse && (
                  <span
                    className={styles.circleAura}
                    style={{ '--aura-color': itemColor }}
                  />
                )}

                <a
                  href={href}
                  target={target}
                  rel={rel}
                  className={styles.circleBtn}
                  style={{ '--btn-bg': itemColor }}
                  aria-label={item.label}
                  title={item.label}
                >
                  <span className={styles.btnInner}>
                    {renderItemIcon(item)}
                  </span>
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
