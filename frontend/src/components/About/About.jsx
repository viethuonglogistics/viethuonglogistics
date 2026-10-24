import { useRef, useEffect, Suspense, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import styles from './About.module.scss'
import { homePageApi } from '../../services/api'

// ─── Themes ────────────────────────────────────────────────────────────────
const THEMES = {
  red: {
    accent: '#cc1a1a', accentRgb: '204,26,26',
    bgGrad: 'radial-gradient(ellipse 65% 50% at 68% 32%, rgba(204,26,26,0.07) 0%, transparent 55%), #f8f6f2',
    ink: '#0d0d0d', inkSoft: '#4a4a4a',
    truckColor: '#cc1a1a',
  },
  orange: {
    accent: '#d96300', accentRgb: '217,99,0',
    bgGrad: 'radial-gradient(ellipse 65% 50% at 65% 28%, rgba(217,99,0,0.09) 0%, transparent 55%), #f8f5ef',
    ink: '#1a0d00', inkSoft: '#4a3520',
    truckColor: '#d96300',
  },
  navy: {
    accent: '#1a3a6b', accentRgb: '26,58,107',
    bgGrad: 'radial-gradient(ellipse 65% 50% at 70% 35%, rgba(26,58,107,0.08) 0%, transparent 55%), #f4f6fa',
    ink: '#0a1628', inkSoft: '#2a3a52',
    truckColor: '#1a3a6b',
  },
  slate: {
    accent: '#2d5a3d', accentRgb: '45,90,61',
    bgGrad: 'radial-gradient(ellipse 65% 50% at 65% 32%, rgba(45,90,61,0.08) 0%, transparent 55%), #f4f7f5',
    ink: '#0a1a0f', inkSoft: '#2a4030',
    truckColor: '#2d5a3d',
  },
}

// ─── Images ────────────────────────────────────────────────────────────────
const IMAGES = {
  intro: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=85',
  stats: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=85',
  milestones: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=1200&q=85',
  values: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=1200&q=85',
}

// ─── Slides ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    theme: 'red',
    label: 'Giới Thiệu',
    decoNum: '01',
    title: 'Đối Tác Tin Cậy',
    titleAccent: 'Trong Từng Chuyến Hàng',
    body: 'Viet Huong Logistics — thành viên chiến lược của Viet Huong Group — cung cấp giải pháp logistics toàn diện, kết nối doanh nghiệp Việt Nam với thị trường toàn cầu bằng công nghệ hiện đại và đội ngũ chuyên nghiệp.',
    pills: ['Vận chuyển nội địa', 'Xuất nhập khẩu', 'Mua hộ quốc tế', 'Kết nối toàn cầu'],
    image: IMAGES.intro,
    imageTag: 'HỆ THỐNG VẬN TẢI',
    cta: true,
  },
  {
    theme: 'orange',
    label: 'Con Số Nổi Bật',
    decoNum: '02',
    title: 'Hành Trình',
    titleAccent: 'Bằng Con Số',
    stats: [
      { num: '15+', raw: 15, suffix: '+', desc: 'Năm kinh nghiệm' },
      { num: '63', raw: 63, suffix: '', desc: 'Tỉnh thành phủ sóng' },
      { num: '500+', raw: 500, suffix: '+', desc: 'Chuyến / ngày' },
      { num: '99%', raw: 99, suffix: '%', desc: 'Giao hàng đúng hẹn' },
    ],
    image: IMAGES.stats,
    imageTag: 'QUY MÔ VẬN HÀNH',
  },
  {
    theme: 'navy',
    label: 'Mốc Lịch Sử',
    decoNum: '03',
    title: 'Hành Trình',
    titleAccent: '15 Năm Phát Triển',
    milestones: [
      { year: '2009', event: 'Thành lập tại TP.HCM — đội xe 12 chiếc đầu tiên' },
      { year: '2015', event: 'Mở rộng 20 tỉnh phía Nam, kho bãi tại Bình Dương' },
      { year: '2019', event: 'Phủ sóng 63 tỉnh thành — mạng lưới toàn quốc' },
      { year: '2023', event: 'Ra mắt hệ thống tracking thời gian thực' },
    ],
    image: IMAGES.milestones,
    imageTag: 'DẤU ẤN TRƯỞNG THÀNH',
  },
  {
    theme: 'slate',
    label: 'Giá Trị Cốt Lõi',
    decoNum: '04',
    title: 'Tầm Nhìn &',
    titleAccent: 'Sứ Mệnh',
    values: [
      {
        icon: '◎',
        title: 'Tầm Nhìn',
        text: 'Trở thành đơn vị uy tín hàng đầu Việt Nam trong lĩnh vực Giao nhận – Vận tải, tạo ra giá trị bền vững cho con người và xã hội.',
      },
      {
        icon: '◈',
        title: 'Sứ Mệnh',
        text: 'Tư vấn và cung cấp chuỗi cung ứng trọn gói với chất lượng và chi phí tốt nhất, dựa trên nền tảng chính trực và đạo đức nghề nghiệp.',
      },
      {
        icon: '◇',
        title: 'Cam Kết',
        text: '"Chuyên nghiệp – Tận tâm – Tin cậy – Hiệu quả": đồng hành cùng khách hàng phát triển dịch vụ và không ngừng nâng cao chất lượng.',
      },
    ],
    image: IMAGES.values,
    imageTag: 'TRIẾT LÝ PHÁT TRIỂN',
  },
]

// Góc nhìn đặc trưng cho từng slide
const SLIDE_ANGLES = [
  Math.PI * 1.35, // 01: Giới thiệu (góc 3/4 trước oai vệ)
  Math.PI * 1.05, // 02: Con số (góc nghiêng thân xe khoe chiều dài chassis)
  Math.PI * 0.72, // 03: Lịch sử (góc 3/4 sau và hệ thống bánh kép)
  Math.PI * 1.82, // 04: Tầm nhìn (góc chính diện mạnh mẽ)
]

const SLIDE_DURATION = 6500
const TRUCK_MODEL_URL = '/models/truck-optimized.glb'

const DEFAULT_ABOUT_INTRO = {
  enabled: true,
  section_label: 'Giới thiệu',
  show_3d_truck: true,
  title: 'Đối Tác Tin Cậy',
  title_accent: 'Trong Từng Chuyến Hàng',
  description: 'Viet Huong Logistics — thành viên chiến lược của Viet Huong Group — cung cấp giải pháp logistics toàn diện, kết nối doanh nghiệp Việt Nam với thị trường toàn cầu bằng công nghệ hiện đại và đội ngũ chuyên nghiệp.',
  pills: 'Vận chuyển nội địa\nXuất nhập khẩu\nMua hộ quốc tế\nKết nối toàn cầu',
  cta_label: 'Tìm Hiểu Thêm',
  cta_link: '/dich-vu#lien-he',
}

function normalizePills(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value || '')
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
}

function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(-0.2, 1.8, -2)
  }, [camera])
  return null
}

function Truck({ targetRef, isHovered }) {
  const { scene } = useGLTF(TRUCK_MODEL_URL)
  const meshRef = useRef()
  const cur = useRef({ rotY: SLIDE_ANGLES[0], posX: 0 })
  const ready = useRef(false)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    if (!scene) return
    const box = new THREE.Box3().setFromObject(scene)
    setOffsetY(-box.min.y)
    if (meshRef.current) meshRef.current.rotation.y = SLIDE_ANGLES[0]
    ready.current = true
  }, [scene])

  useFrame((state, delta) => {
    if (!meshRef.current || !ready.current) return
    const alpha = 1 - Math.pow(0.003, delta)
    const dRotY = targetRef.current.rotY - cur.current.rotY
    cur.current.rotY += dRotY * alpha

    // Tự động xoay nhẹ nhàng liên tục (showroom turntable) khi không tương tác rê chuột
    if (!isHovered.current) {
      targetRef.current.rotY += delta * 0.08
    }

    meshRef.current.rotation.y = cur.current.rotY
  })

  return <primitive ref={meshRef} object={scene} scale={1.14} position={[0, offsetY, 0]} />
}
useGLTF.preload(TRUCK_MODEL_URL)

// ─── Main Component ────────────────────────────────────────────────────────
export default function About() {
  const sectionRef = useRef(null)
  const slideRefs = useRef([])
  const bgRef = useRef(null)
  const mountedRef = useRef(true)
  const counterTweens = useRef([])
  const isCanvasHovered = useRef(false)

  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [aboutIntro, setAboutIntro] = useState(DEFAULT_ABOUT_INTRO)

  const truckTarget = useRef({ rotY: SLIDE_ANGLES[0] })

  const [renderQuality] = useState(() => {
    if (typeof window === 'undefined') return { antialias: true, dpr: 1 }
    const cpuCores = navigator.hardwareConcurrency || 8
    const memory = navigator.deviceMemory || 8
    const constrained = window.matchMedia('(max-width: 960px)').matches || cpuCores <= 4 || memory <= 4
    return {
      antialias: !constrained,
      dpr: constrained ? 1 : [1, 1.1],
    }
  })

  useEffect(() => {
    let cancelled = false
    homePageApi.get()
      .then(res => {
        if (cancelled) return
        setAboutIntro({
          ...DEFAULT_ABOUT_INTRO,
          ...(res.data?.about_intro || {}),
        })
      })
      .catch(() => { })
    return () => { cancelled = true }
  }, [])

  const slides = useMemo(() => {
    const introPills = normalizePills(aboutIntro.pills)
    return SLIDES.map((slide, index) => {
      if (index !== 0) return slide
      return {
        ...slide,
        label: aboutIntro.section_label || slide.label,
        title: aboutIntro.title || slide.title,
        titleAccent: aboutIntro.title_accent || slide.titleAccent,
        body: aboutIntro.description || slide.body,
        pills: introPills.length ? introPills : slide.pills,
        ctaLabel: aboutIntro.cta_label || 'Tìm Hiểu Thêm',
        ctaLink: aboutIntro.cta_link || '/dich-vu#lien-he',
      }
    })
  }, [aboutIntro])

  const applyTheme = useCallback((themeName) => {
    if (!mountedRef.current) return
    const t = THEMES[themeName] || THEMES.red
    const root = sectionRef.current
    if (!root) return
    root.style.setProperty('--accent', t.accent)
    root.style.setProperty('--accent-rgb', t.accentRgb)
    root.style.setProperty('--ink', t.ink)
    root.style.setProperty('--ink-soft', t.inkSoft)
    if (bgRef.current) bgRef.current.style.background = t.bgGrad
  }, [])

  const animateCounters = useCallback(() => {
    if (!mountedRef.current) return
    const el = slideRefs.current[1]
    if (!el) return
    counterTweens.current.forEach(t => t.kill())
    counterTweens.current = []
    el.querySelectorAll('[data-count]').forEach(node => {
      if (!node) return
      gsap.killTweensOf(node)
      const target = parseFloat(node.dataset.count)
      const suffix = node.dataset.suffix || ''
      node.innerText = '0' + suffix
      const tween = gsap.to(node, {
        duration: 2.0,
        ease: 'power3.out',
        onUpdate() {
          if (!mountedRef.current || !node.isConnected) return
          node.innerText = Math.round(this.progress() * target) + suffix
        },
      })
      counterTweens.current.push(tween)
    })
  }, [])

  // Chuyển slide thủ công hoặc tự động
  const switchSlide = useCallback((nextIdx) => {
    setActive(nextIdx)
    applyTheme(slides[nextIdx]?.theme)
    truckTarget.current.rotY = SLIDE_ANGLES[nextIdx]
    if (nextIdx === 1) {
      setTimeout(() => animateCounters(), 150)
    }
  }, [animateCounters, applyTheme, slides])

  // Autoplay tự động chuyển slide mỗi 6.5s (dừng lại khi rê chuột vào)
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % slides.length
        applyTheme(slides[next]?.theme)
        truckTarget.current.rotY = SLIDE_ANGLES[next]
        if (next === 1) setTimeout(() => animateCounters(), 150)
        return next
      })
    }, SLIDE_DURATION)

    return () => clearInterval(interval)
  }, [isPaused, slides.length, applyTheme, animateCounters])

  useEffect(() => {
    mountedRef.current = true
    applyTheme(slides[active]?.theme)
    return () => {
      mountedRef.current = false
      counterTweens.current.forEach(t => t.kill())
      counterTweens.current = []
    }
  }, [active, applyTheme, slides])

  if (aboutIntro.enabled === false) return null

  const at = THEMES[slides[active]?.theme] || THEMES.red

  return (
    <section
      id="about"
      ref={sectionRef}
      className={styles.about}
      style={{ '--accent': at.accent, '--accent-rgb': at.accentRgb, '--ink': at.ink, '--ink-soft': at.inkSoft }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div ref={bgRef} className={styles.gradientBg} />
      <div className={styles.grain} />
      <div className={styles.redBar} />

      <div className={styles.container}>
        {/* ── Top Tabs Navigation (01, 02, 03, 04) ── */}
        <div className={styles.topNavWrap}>
          <div className={styles.tabsNav} role="tablist">
            {slides.map((s, i) => {
              const isActive = active === i
              const theme = THEMES[s.theme]
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
                  onClick={() => switchSlide(i)}
                  style={isActive ? { '--tab-accent': theme.accent } : {}}
                >
                  <span className={styles.tabIdx}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.tabLabel}>{s.label}</span>
                  {isActive && (
                    <span
                      key={`${active}-${isPaused}`}
                      className={styles.tabProgressBar}
                      style={{
                        background: theme.accent,
                        animationDuration: `${SLIDE_DURATION}ms`,
                        animationPlayState: isPaused ? 'paused' : 'running',
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Nút Prev / Next tiện dụng */}
          <div className={styles.navArrows}>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={() => switchSlide((active - 1 + slides.length) % slides.length)}
              aria-label="Mục trước"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={() => switchSlide((active + 1) % slides.length)}
              aria-label="Mục tiếp theo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Main Showcase Body ── */}
        <div className={styles.mainGrid}>
          {/* Cột trái: Nội dung động của Slide */}
          <div className={styles.contentCol}>
            {slides.map((slide, i) => {
              const isCurr = active === i
              const t = THEMES[slide.theme]

              return (
                <div
                  key={i}
                  ref={el => (slideRefs.current[i] = el)}
                  className={`${styles.slideCard} ${isCurr ? styles.slideCardActive : ''}`}
                >
                  {/* Số Watermark mờ nghệ thuật */}
                  <div className={styles.decoNumber}>{slide.decoNum}</div>

                  {/* Ảnh tiêu điểm minh họa */}
                  <div className={styles.slideImgWrap}>
                    <img src={slide.image} alt={slide.label} className={styles.slideImg} loading="lazy" />
                    <div className={styles.slideImgOverlay} />
                    <div
                      className={styles.slideImgTag}
                      style={{ color: t.accent, borderColor: `${t.accent}40` }}
                    >
                      {slide.imageTag || slide.label}
                    </div>
                  </div>

                  {/* Badge định danh */}
                  <div className={styles.labelBadge} style={{ color: t.accent }}>
                    <span className={styles.labelDot} style={{ background: t.accent }} />
                    {slide.label}
                  </div>

                  {/* Tiêu đề chính */}
                  <h2 className={styles.title} style={{ color: t.ink }}>
                    {slide.title}
                    <br />
                    <span className={styles.titleAccentShimmer}>{slide.titleAccent}</span>
                  </h2>

                  {/* Nội dung slide 01 (Giới thiệu) */}
                  {slide.body && (
                    <p className={styles.body} style={{ color: t.inkSoft }}>{slide.body}</p>
                  )}

                  {slide.pills && (
                    <div className={styles.pills}>
                      {slide.pills.map((p, j) => (
                        <span key={j} className={styles.pill} style={{ color: t.accent }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  {slide.cta && (
                    <Link to={slide.ctaLink || '/dich-vu#lien-he'} className={styles.cta} style={{ color: t.accent }}>
                      {slide.ctaLabel || 'Tìm Hiểu Thêm'}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}

                  {/* Nội dung slide 02 (Con số nổi bật) */}
                  {slide.stats && (
                    <div className={styles.statsGrid}>
                      {slide.stats.map((s, j) => (
                        <div key={j} className={styles.statItem}>
                          <span className={styles.statAccentLine} style={{ background: t.accent }} />
                          <span
                            className={styles.statNum}
                            data-count={s.raw}
                            data-suffix={s.suffix}
                            style={{ color: t.accent }}
                          >
                            {s.num}
                          </span>
                          <span className={styles.statDesc}>{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nội dung slide 03 (Mốc lịch sử) */}
                  {slide.milestones && (
                    <div className={styles.milestones}>
                      {slide.milestones.map((m, j) => (
                        <div key={j} className={styles.milestone}>
                          <span className={styles.milestoneIdx}>{String(j + 1).padStart(2, '0')}</span>
                          <span className={styles.year} style={{ color: t.accent }}>{m.year}</span>
                          <span className={styles.event} style={{ color: t.inkSoft }}>{m.event}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nội dung slide 04 (Giá trị cốt lõi) */}
                  {slide.values && (
                    <div className={styles.valuesGrid}>
                      {slide.values.map((v, j) => (
                        <div key={j} className={styles.valueItem} style={{ borderColor: `${t.accent}20` }}>
                          <span className={styles.valueIcon} style={{ color: t.accent }}>{v.icon}</span>
                          <div className={styles.valueContent}>
                            <span className={styles.valueTitle} style={{ color: t.ink }}>{v.title}</span>
                            <p className={styles.valueText} style={{ color: t.inkSoft }}>{v.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Cột phải: 3D Showroom Xe Đầu Kéo Tự Xoay */}
          <div
            className={styles.canvasCol}
            onMouseEnter={() => { isCanvasHovered.current = true }}
            onMouseLeave={() => { isCanvasHovered.current = false }}
          >
            {/* Hiệu ứng bệ hào quang sàn & vạch laser cao tốc */}
            <div
              className={styles.truckStageGlow}
              style={{ background: `radial-gradient(ellipse 65% 45% at 50% 50%, rgba(${at.accentRgb}, 0.16) 0%, transparent 70%)` }}
            />
            <div
              className={styles.truckRoadMarks}
              style={{ background: `linear-gradient(90deg, transparent 0%, rgba(${at.accentRgb}, 0.16) 20%, rgba(${at.accentRgb}, 0.35) 50%, rgba(${at.accentRgb}, 0.16) 80%, transparent 100%)` }}
            />

            {/* Khung viền góc tinh tế */}
            <div className={styles.cornerTL} style={{ borderColor: at.accent }} />
            <div className={styles.cornerBR} style={{ borderColor: at.accent }} />

            {/* Huy hiệu hướng dẫn tương tác */}
            <div className={styles.dragHintBadge}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 12h8m-8 0l3-3m-3 3l3 3m5-3l-3-3m3 3l-3 3" />
              </svg>
              <span>Xe tự xoay 360° · Giữ chuột để xoay tự do</span>
            </div>

            {/* Chỉ số slide góc sàn */}
            <div className={styles.slideNum}>
              <span className={styles.slideNumCurrent}>{String(active + 1).padStart(2, '0')}</span>
              <span className={styles.slideNumSep}> / </span>
              <span className={styles.slideNumTotal}>{String(slides.length).padStart(2, '0')}</span>
            </div>

            <Canvas
              camera={{ position: [-1, 8.8, 22.5], fov: 21.5 }}
              gl={{
                alpha: true,
                antialias: renderQuality.antialias,
                powerPreference: 'high-performance',
              }}
              dpr={renderQuality.dpr}
              style={{ width: '100%', height: '100%', background: 'transparent' }}
            >
              <Suspense fallback={null}>
                <CameraSetup />
                <ambientLight intensity={1.3} />
                <directionalLight position={[6, 9, 6]} intensity={2.5} />
                <directionalLight position={[-6, 5, -3]} intensity={1.0} />
                <Truck targetRef={truckTarget} isHovered={isCanvasHovered} />
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  maxPolarAngle={Math.PI / 2 + 0.05}
                  minPolarAngle={Math.PI / 3.4}
                  rotateSpeed={0.8}
                />
                <ContactShadows
                  position={[0, 0, 0]}
                  opacity={0.35}
                  scale={20}
                  blur={2.4}
                  far={4.5}
                  frames={1}
                  resolution={256}
                />
                <Environment preset="city" background={false} />
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>
    </section>
  )
}
