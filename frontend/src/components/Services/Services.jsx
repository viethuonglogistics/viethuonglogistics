import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { homePageApi, resolveApiMediaUrl, servicePageApi } from '../../services/api'
import styles from './Services.module.scss'

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    id: 'van-tai-hang-noi-dia-va-quoc-te',
    slug: 'van-tai-hang-noi-dia-va-quoc-te',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="14" width="36" height="24" rx="2" />
        <path d="M6 22h36M18 14v24M6 30h12" />
        <circle cx="14" cy="40" r="3" />
        <circle cx="34" cy="40" r="3" />
      </svg>
    ),
    label: '01',
    title: 'Vận Tải Hàng Nội Địa Và Quốc Tế',
    desc: 'Giải pháp vận tải đa phương thức kết hợp đường bộ 63 tỉnh thành, đường biển FCL/LCL và hàng không toàn cầu.',
    features: ['Đa phương thức', 'Incoterms FOB/CIF', 'GPS tracking 24/7'],
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&q=80&auto=format',
    link: '/dich-vu/van-tai-hang-noi-dia-va-quoc-te',
  },
  {
    id: 'nhan-uy-thac-xuat-khau-nhap-khau',
    slug: 'nhan-uy-thac-xuat-khau-nhap-khau',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 24C4 13 13 4 24 4s20 9 20 20-9 20-20 20S4 35 4 24z" />
        <path d="M4 24h40M24 4c-5.5 6-8.5 12.5-8.5 20s3 14 8.5 20M24 4c5.5 6 8.5 12.5 8.5 20s-3 14-8.5 20" />
      </svg>
    ),
    label: '02',
    title: 'Nhận Ủy Thác Xuất Khẩu, Nhập Khẩu',
    desc: 'Đại diện tìm kiếm nguồn hàng, thương lượng giá quốc tế, thanh toán và xử lý thủ tục hải quan trọn gói.',
    features: ['Ủy thác XNK trọn gói', 'Chứng từ C/O, FDA', 'Thanh toán quốc tế'],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80&auto=format',
    link: '/dich-vu/nhan-uy-thac-xuat-khau-nhap-khau',
  },
  {
    id: 'cho-thue-kho-bai',
    slug: 'cho-thue-kho-bai',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="10" width="40" height="30" rx="2" />
        <path d="M4 20h40M16 10v30M12 15h2M12 25h2M12 32h2" />
      </svg>
    ),
    label: '03',
    title: 'Cho Thuê Kho, Bãi',
    desc: 'Hệ thống kho bãi tiêu chuẩn tại Đà Nẵng, Hải Phòng, TP.HCM với phần mềm quản lý WMS thông minh.',
    features: ['Hệ thống WMS hiện đại', 'Kho tiêu chuẩn an toàn', 'Bảo hiểm hàng hóa 100%'],
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&q=80&auto=format',
    link: '/dich-vu/cho-thue-kho-bai',
  },
  {
    id: 'dich-vu-tron-goi-hang-du-an',
    slug: 'dich-vu-tron-goi-hang-du-an',
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
    title: 'Dịch Vụ Trọn Gói Hàng Dự Án',
    desc: 'Vận chuyển hàng công trình, máy móc thiết bị nhà xưởng và hàng siêu trường siêu trọng chuyên nghiệp.',
    features: ['Hàng siêu trường siêu trọng', 'Khảo sát hiện trường', 'Phương tiện chuyên dụng'],
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=900&q=80&auto=format',
    link: '/dich-vu/dich-vu-tron-goi-hang-du-an',
  },
  {
    id: 'dich-vu-giao-nhan-thu-tuc-hai-quan',
    slug: 'dich-vu-giao-nhan-thu-tuc-hai-quan',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M24 4L6 12v12c0 11.1 7.7 21.5 18 24 10.3-2.5 18-12.9 18-24V12L24 4z" />
        <path d="M18 24l4 4 8-8" />
      </svg>
    ),
    label: '05',
    title: 'Dịch Vụ Giao Nhận, Thủ Tục Hải Quan',
    desc: 'Khai báo hải quan điện tử nhanh chóng, tư vấn áp mã HS Code tối ưu thuế, hỗ trợ C/O và giao nhận Door-to-Door.',
    features: ['Thông quan nhanh chóng', 'Tư vấn mã HS Code', 'Giao nhận Door-to-Door'],
    image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=900&q=80&auto=format',
    link: '/dich-vu/dich-vu-giao-nhan-thu-tuc-hai-quan',
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
        {/* ── Tiêu đề căn giữa phong cách hiện đại, thanh lịch ── */}
        <div className={styles.header}>
          <span className={styles.headerLabel}>DỊCH VỤ CỦA CHÚNG TÔI</span>
          <h2 className={styles.headerTitle}>
            {section.title || 'Giải Pháp Vận Tải'}
            {section.accent && <span className={styles.accent}> {section.accent}</span>}
          </h2>
          <p className={styles.headerSub}>
            Cung cấp các giải pháp logistics và vận chuyển toàn diện, tối ưu chi phí và đồng hành cùng sự phát triển bền vững của doanh nghiệp
          </p>
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
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop';
                  }}
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
                    {s.features.slice(0, 3).map((f, fi) => (
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
