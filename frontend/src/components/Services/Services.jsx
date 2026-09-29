import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { homePageApi, resolveApiMediaUrl, servicePageApi } from '../../services/api'
import styles from './Services.module.scss'

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    id: 'domestic',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="14" width="36" height="24" rx="2" />
        <path d="M6 22h36M18 14v24M6 30h12" />
        <circle cx="14" cy="40" r="3" />
        <circle cx="34" cy="40" r="3" />
      </svg>
    ),
    label: '01',
    title: 'Vận Chuyển Nội Địa',
    desc: 'Mạng lưới 63 tỉnh thành, giao hàng đúng hẹn với đội xe tải trọng tải 1–30 tấn.',
    features: ['Xe tải, container', 'Theo dõi GPS thời gian thực', 'Bảo hiểm hàng hóa'],
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&q=80&auto=format',
    size: 'large',
  },
  {
    id: 'international',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 24C4 13 13 4 24 4s20 9 20 20-9 20-20 20S4 35 4 24z" />
        <path d="M4 24h40M24 4c-5.5 6-8.5 12.5-8.5 20s3 14 8.5 20M24 4c5.5 6 8.5 12.5 8.5 20s-3 14-8.5 20" />
      </svg>
    ),
    label: '02',
    title: 'Vận Chuyển Quốc Tế',
    desc: 'Kết nối Việt Nam với ASEAN, Trung Quốc, châu Âu qua đường bộ, biển và hàng không.',
    features: ['Thủ tục hải quan', 'Door-to-door', 'FCL & LCL'],
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=900&q=80&auto=format',
    size: 'tall',
  },
  {
    id: 'warehouse',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="10" width="40" height="30" rx="2" />
        <path d="M4 20h40M16 10v30M12 15h2M12 25h2M12 32h2" />
      </svg>
    ),
    label: '03',
    title: 'Logistics & Kho Bãi',
    desc: 'Hệ thống kho hiện đại tại TP.HCM, Hà Nội, Đà Nẵng. Quản lý hàng hóa tự động.',
    features: ['Kho lạnh & kho thường', 'Hệ thống WMS', 'Bốc xếp chuyên nghiệp'],
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&q=80&auto=format',
    size: 'small',
  },
  {
    id: 'express',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 8h28l4 12H6L10 8z" />
        <rect x="4" y="20" width="40" height="6" rx="1" />
        <path d="M8 26v12M40 26v12M4 38h40" />
        <circle cx="16" cy="40" r="3" />
        <circle cx="32" cy="40" r="3" />
      </svg>
    ),
    label: '04',
    title: 'Chuyển Phát Nhanh',
    desc: 'Giao hàng nội thành trong 2–4 giờ, liên tỉnh 24–48 giờ. Cam kết đúng giờ.',
    features: ['Giao hàng hỏa tốc', 'COD linh hoạt', 'App theo dõi đơn hàng'],
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=900&q=80&auto=format',
    size: 'wide',
  },
]

const DEFAULT_SECTION = {
  enabled: true,
  title: 'Giải Pháp Vận Tải',
  accent: 'Toàn Diện',
  cta_label: 'Tư Vấn Miễn Phí',
  cta_link: '/dich-vu#lien-he',
}

const CARD_SIZES = ['large', 'tall', 'small', 'wide']

function normalizeServiceItems(items) {
  if (!Array.isArray(items)) return []

  return items
    .filter(item => item?.is_active !== 0 && item?.is_active !== false)
    .map((item, index) => ({
      id: item.slug || item.id || `service-${index}`,
      slug: item.slug,
      label: String(index + 1).padStart(2, '0'),
      title: item.title || '',
      desc: item.subtitle || item.description || '',
      features: Array.isArray(item.tags) && item.tags.length ? item.tags : [],
      image: resolveApiMediaUrl(item.image),
      size: CARD_SIZES[index % CARD_SIZES.length],
      link: item.slug ? `/dich-vu/${item.slug}` : '/dich-vu',
    }))
    .filter(item => item.title && item.image)
}

export default function Services() {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])
  const [section, setSection] = useState(DEFAULT_SECTION)
  const [managedServices, setManagedServices] = useState([])
  const displayedServices = useMemo(
    () => (managedServices.length ? managedServices : services),
    [managedServices],
  )

  useEffect(() => {
    let cancelled = false
    homePageApi.get()
      .then(res => {
        if (!cancelled && res.data?.services_section) {
          setSection({ ...DEFAULT_SECTION, ...res.data.services_section })
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    servicePageApi.getItems()
      .then(res => {
        if (!cancelled) {
          setManagedServices(normalizeServiceItems(res.data))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])


  useEffect(() => {
    const ctx = gsap.context(() => {
      const animateFromTo = (target, fromVars, toVars) => {
        const elements = gsap.utils.toArray(target)
        if (!elements.length) return
        gsap.fromTo(elements, fromVars, toVars)
      }

      // Header reveal
      animateFromTo(
        `.${styles.headerLabel}`,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        }
      )
      animateFromTo(
        `.${styles.headerTitle}`,
        { y: 50, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
        {
          y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power4.out', delay: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        }
      )
      animateFromTo(
        `.${styles.headerSub}`,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.25,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        }
      )

      // Cards stagger reveal
      const cards = cardsRef.current.filter(Boolean)
      if (cards.length) {
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
          }
        )
      }
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [displayedServices])

  if (!section.enabled) return null

  return (
    <section id="services" ref={sectionRef} className={styles.services}>
      <div className={styles.container}>
        {/* ── Tiêu đề căn giữa chuẩn như ảnh mẫu ── */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>
            {section.title || 'Giải Pháp Vận Tải'}
            {section.accent && <span className={styles.accent}> {section.accent}</span>}
          </h2>
        </div>

        {/* ── Lưới các ô vuông/thẻ dịch vụ chuẩn đều đặn theo chủ đề Đỏ - Đen - Trắng ── */}
        <div className={styles.cardsGrid}>
          {displayedServices.map((s, i) => (
            <article
              key={s.id}
              ref={(el) => (cardsRef.current[i] = el)}
              className={styles.card}
              itemScope
              itemType="https://schema.org/Service"
            >
              {/* Hình ảnh phía trên có badge số thứ tự và hiệu ứng chuyển động */}
              <div className={styles.imageWrap}>
                <img
                  src={s.image}
                  alt={s.title}
                  className={styles.cardImg}
                  loading="lazy"
                />
                <div className={styles.imageShine} aria-hidden="true" />
                <span className={styles.cardBadge}>{s.label || `0${i + 1}`}</span>
              </div>

              {/* Nội dung bên dưới với tiêu đề to rõ, mô tả và chữ mô tả nhỏ nhỏ (features) */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle} itemProp="name">
                  {s.title}
                </h3>

                <p className={styles.cardDesc} itemProp="description">
                  {s.desc}
                </p>

                {/* Danh sách chữ mô tả nhỏ nhỏ (Features) — điểm nhấn khi di chuột vào */}
                {Array.isArray(s.features) && s.features.length > 0 && (
                  <ul className={styles.cardFeatures}>
                    {s.features.map((f, fi) => (
                      <li key={fi}>
                        <span className={styles.checkIcon}>
                          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.5 6.2L4.8 8.5L9.5 3.5" />
                          </svg>
                        </span>
                        <span className={styles.featureText}>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Nút Xem thêm hình viên thuốc căn giữa mang phong cách Đỏ - Đen - Trắng */}
                <div className={styles.cardAction}>
                  <Link to={s.link || '/dich-vu'} className={styles.btnMore}>
                    <span>Xem thêm</span>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.btnArrow}>
                      <path d="M4 10h12M11 5l5 5-5 5" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
} 
