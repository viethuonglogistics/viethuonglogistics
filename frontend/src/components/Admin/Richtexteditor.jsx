import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Node, mergeAttributes, Extension } from '@tiptap/core'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import {
  Heading2, Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon,
  List, ListOrdered, Undo2, Redo2, Image as ImageIcon, Megaphone, Loader2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Highlighter, ChevronDown,
  Table as TableIcon, Settings, X, Trash2, AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon, AlignRight as AlignRightIcon, Check, RefreshCw,
} from 'lucide-react'
import { blogApi } from '../../services/api'
import styles from './RichtextEditor.module.scss'

// ── Portal Dropdown ──────────────────────────────────────
function DropdownMenu({ anchorRef, open, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    })
  }, [open, anchorRef])

  if (!open) return null

  return ReactDOM.createPortal(
    <div style={{
      position: 'absolute',
      top: pos.top,
      left: pos.left,
      zIndex: 99999,
      background: '#fff',
      border: '1px solid #e2e2e2',
      borderRadius: 8,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      padding: 6,
      minWidth: 150,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      {children}
    </div>,
    document.body
  )
}

// ── CalloutBox Node ──────────────────────────────────────
const CALLOUT_COLORS = ['red', 'blue', 'yellow', 'green']
const CALLOUT_LABEL = { red: 'Đỏ', blue: 'Xanh dương', yellow: 'Vàng', green: 'Xanh lá' }

const CalloutBox = Node.create({
  name: 'calloutBox', group: 'block', content: 'block+', defining: true,
  addAttributes() {
    return { color: { default: 'red', parseHTML: (el) => el.getAttribute('data-color') || 'red', renderHTML: (attrs) => ({ 'data-color': attrs.color }) } }
  },
  parseHTML() { return [{ tag: 'div.callout-box' }] },
  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: `callout-box callout-${node.attrs.color || 'red'}` }), 0]
  },
  addCommands() {
    return {
      setCalloutBox: (color = 'red') => ({ commands }) => commands.wrapIn(this.name, { color }),
      unsetCalloutBox: () => ({ commands }) => commands.lift(this.name),
    }
  },
})

// ── CustomFigure Node (Atomic Block Extension cho Hình ảnh + Mô tả ảnh) ──
const CustomFigure = Node.create({
  name: 'customFigure',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
      caption: { default: '' },
      align: { default: 'center' }, // 'left' | 'center' | 'right'
      width: { default: '100' }, // '100' | '75' | '50'
      captionAlign: { default: 'center' }, // 'left' | 'center' | 'right'
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (el) => {
          const img = el.querySelector('img')
          const figcaption = el.querySelector('figcaption')

          let align = 'center'
          if (el.classList.contains('align-left')) align = 'left'
          if (el.classList.contains('align-right')) align = 'right'

          let width = '100'
          if (el.classList.contains('width-75')) width = '75'
          if (el.classList.contains('width-50')) width = '50'

          let captionAlign = 'center'
          if (el.classList.contains('caption-left') || figcaption?.style.textAlign === 'left') captionAlign = 'left'
          if (el.classList.contains('caption-right') || figcaption?.style.textAlign === 'right') captionAlign = 'right'

          return {
            src: img?.getAttribute('src') || '',
            alt: img?.getAttribute('alt') || '',
            caption: figcaption ? figcaption.textContent : (img?.getAttribute('alt') || ''),
            align,
            width,
            captionAlign,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const { src, alt, caption, align, width, captionAlign } = node.attrs

    const figureClasses = [
      'blog-image-figure',
      `align-${align || 'center'}`,
      `width-${width || '100'}`,
      `caption-${captionAlign || 'center'}`,
    ].join(' ')

    const children = [
      ['img', { src, alt: alt || caption || '', class: 'blog-content-image' }],
    ]

    if (caption && caption.trim()) {
      children.push(['figcaption', { class: 'blog-image-caption', style: `text-align: ${captionAlign || 'center'}` }, caption])
    }

    return ['figure', mergeAttributes(HTMLAttributes, { class: figureClasses }), ...children]
  },
})

// ── FontSize Extension ───────────────────────────────────
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{ types: this.options.types, attributes: { fontSize: { default: null, parseHTML: (el) => el.style.fontSize || null, renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {} } } }]
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ chain }) => chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).run(),
    }
  },
})

const FONT_SIZES = [
  { label: 'Nhỏ', value: '13px' },
  { label: 'Mặc định', value: null },
  { label: 'Vừa', value: '18px' },
  { label: 'Lớn', value: '22px' },
  { label: 'Rất lớn', value: '28px' },
]

const HIGHLIGHT_COLORS = [
  { label: 'Vàng', value: '#fff3a3' },
  { label: 'Xanh', value: '#b8e6c9' },
  { label: 'Hồng', value: '#fcd2e0' },
  { label: 'Cam', value: '#ffd9a8' },
]

// ════════════════════════════════════════════════════════
export default function RichTextEditor({ value, onChange, placeholder }) {
  const fileInputRef        = useRef(null)
  const replaceFileInputRef = useRef(null)
  const sizeBtnRef          = useRef(null)
  const highlightBtnRef     = useRef(null)
  const calloutBtnRef       = useRef(null)
  const tableBtnRef         = useRef(null)

  const [uploading, setUploading]           = useState(false)
  const [replacingImg, setReplacingImg]     = useState(false)
  const [colorMenuOpen, setColorMenuOpen]   = useState(false)
  const [sizeMenuOpen, setSizeMenuOpen]     = useState(false)
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false)
  const [tableMenuOpen, setTableMenuOpen]   = useState(false)

  // ── Modal Overlay State cho Cấu Hình Hình Ảnh ──
  const [modalOpen, setModalOpen]                   = useState(false)
  const [modalMode, setModalMode]                   = useState('insert') // 'insert' | 'edit'
  const [modalImgSrc, setModalImgSrc]               = useState('')
  const [modalCaption, setModalCaption]             = useState('')
  const [modalCaptionAlign, setModalCaptionAlign]   = useState('center') // 'left' | 'center' | 'right'
  const [modalImgAlign, setModalImgAlign]           = useState('center') // 'left' | 'center' | 'right'
  const [modalImgWidth, setModalImgWidth]           = useState('100') // '100' | '75' | '50'
  const [editingPos, setEditingPos]                 = useState(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2] } }),
      Image.configure({ HTMLAttributes: { class: 'blog-content-image' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, FontSize,
      Highlight.configure({ multicolor: true }),
      CalloutBox,
      CustomFigure,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'blog-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: styles.editorArea },
      handleClick(view, pos, event) {
        // Khi người dùng click vào hình ảnh trong nội dung -> Mở ngay ModalOverlay với thông số hiện tại
        const figureEl = event.target.closest('figure') || event.target.closest('img')
        if (figureEl) {
          const node = view.state.doc.nodeAt(pos)
          if (node && node.type.name === 'customFigure') {
            const attrs = node.attrs
            setModalImgSrc(attrs.src || '')
            setModalCaption(attrs.caption || attrs.alt || '')
            setModalCaptionAlign(attrs.captionAlign || 'center')
            setModalImgAlign(attrs.align || 'center')
            setModalImgWidth(attrs.width || '100')
            setEditingPos(pos)
            setModalMode('edit')
            setModalOpen(true)
            return true
          }
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const nextContent = value || ''
    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) return null

  const handlePickImage = () => fileInputRef.current?.click()

  // ── Sau khi chọn ảnh -> Tải lên Cloudinary -> BẬT NGAY MODAL OVERLAY CHỈNH SỬA ──
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Vui lòng chọn file ảnh.'); return }
    setUploading(true)
    try {
      const res = await blogApi.uploadContentImage(file)
      const url = res.url || res.data?.url
      if (!url) throw new Error('Không nhận được URL ảnh.')

      // Thiết lập thông số ban đầu và MỞ NGAY MODAL OVERLAY
      setModalImgSrc(url)
      setModalCaption('')
      setModalCaptionAlign('center')
      setModalImgAlign('center')
      setModalImgWidth('100')
      setEditingPos(null)
      setModalMode('insert')
      setModalOpen(true)
    } catch (err) {
      alert(err.message || 'Upload ảnh thất bại.')
    } finally {
      setUploading(false)
    }
  }

  // ── THAY THẾ BẰNG ẢNH KHÁC (Trong Modal Overlay) ──
  const handleReplaceFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Vui lòng chọn file ảnh.'); return }
    setReplacingImg(true)
    try {
      const res = await blogApi.uploadContentImage(file)
      const url = res.url || res.data?.url
      if (!url) throw new Error('Không nhận được URL ảnh mới.')

      // Cập nhật URL ảnh mới mà GIỮ NGUYÊN các cấu hình hiện tại
      setModalImgSrc(url)
    } catch (err) {
      alert(err.message || 'Upload ảnh thay thế thất bại.')
    } finally {
      setReplacingImg(false)
    }
  }

  // ── Nút "CẬP NHẬT" trong Modal Overlay ──
  const handleSaveModal = () => {
    if (modalMode === 'insert') {
      // Chèn CustomFigure mới vào nội dung
      editor.chain().focus().insertContent({
        type: 'customFigure',
        attrs: {
          src: modalImgSrc,
          alt: modalCaption,
          caption: modalCaption,
          align: modalImgAlign,
          width: modalImgWidth,
          captionAlign: modalCaptionAlign,
        },
      }).run()
    } else if (modalMode === 'edit') {
      // Cập nhật CustomFigure đang có trong nội dung
      if (editingPos !== null) {
        editor.chain().focus().setNodeSelection(editingPos).updateAttributes('customFigure', {
          src: modalImgSrc,
          alt: modalCaption,
          caption: modalCaption,
          align: modalImgAlign,
          width: modalImgWidth,
          captionAlign: modalCaptionAlign,
        }).run()
      } else {
        editor.chain().focus().updateAttributes('customFigure', {
          src: modalImgSrc,
          alt: modalCaption,
          caption: modalCaption,
          align: modalImgAlign,
          width: modalImgWidth,
          captionAlign: modalCaptionAlign,
        }).run()
      }
    }
    setModalOpen(false)
  }

  // ── Nút "XÓA HÌNH ẢNH" trong Modal Overlay ──
  const handleDeleteModal = () => {
    if (editingPos !== null) {
      editor.chain().focus().setNodeSelection(editingPos).deleteSelection().run()
    } else {
      editor.chain().focus().deleteNode('customFigure').run()
    }
    setModalOpen(false)
  }

  const insertCallout = (color) => {
    setColorMenuOpen(false)
    if (editor.isActive('calloutBox')) {
      editor.chain().focus().updateAttributes('calloutBox', { color }).run()
    } else {
      editor.chain().focus().setCalloutBox(color).run()
    }
  }

  const applyFontSize = (size) => {
    setSizeMenuOpen(false)
    size ? editor.chain().focus().setFontSize(size).run()
         : editor.chain().focus().unsetFontSize().run()
  }

  const applyHighlight = (color) => {
    setHighlightMenuOpen(false)
    editor.chain().focus().toggleHighlight({ color }).run()
  }

  const currentFontSizeLabel =
    FONT_SIZES.find(s => s.value === editor.getAttributes('textStyle').fontSize)?.label || 'Cỡ chữ'

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>

        <button type="button" className={editor.isActive('heading', { level: 2 }) ? styles.active : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Tiêu đề H2">
          <Heading2 size={16} />
        </button>

        {/* Cỡ chữ */}
        <div className={styles.colorPickerWrap}>
          <button ref={sizeBtnRef} type="button" className={styles.sizeBtn} onClick={() => setSizeMenuOpen(v => !v)} title="Cỡ chữ">
            <span>{currentFontSizeLabel}</span><ChevronDown size={13} />
          </button>
          <DropdownMenu anchorRef={sizeBtnRef} open={sizeMenuOpen}>
            {FONT_SIZES.map(s => (
              <button key={s.label} type="button" className={styles.colorMenuItem} onClick={() => applyFontSize(s.value)} style={s.value ? { fontSize: s.value } : undefined}>
                {s.label}
              </button>
            ))}
          </DropdownMenu>
        </div>

        <span className={styles.divider} />

        <button type="button" className={editor.isActive('bold') ? styles.active : ''} onClick={() => editor.chain().focus().toggleBold().run()} title="In đậm"><BoldIcon size={16} /></button>
        <button type="button" className={editor.isActive('italic') ? styles.active : ''} onClick={() => editor.chain().focus().toggleItalic().run()} title="In nghiêng"><ItalicIcon size={16} /></button>
        <button type="button" className={editor.isActive('underline') ? styles.active : ''} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Gạch chân"><UnderlineIcon size={16} /></button>

        {/* Highlight */}
        <div className={styles.colorPickerWrap}>
          <button ref={highlightBtnRef} type="button" className={editor.isActive('highlight') ? styles.active : ''} onClick={() => setHighlightMenuOpen(v => !v)} title="Tô màu">
            <Highlighter size={16} />
          </button>
          <DropdownMenu anchorRef={highlightBtnRef} open={highlightMenuOpen}>
            {HIGHLIGHT_COLORS.map(h => (
              <button key={h.value} type="button" className={styles.colorMenuItem} onClick={() => applyHighlight(h.value)}>
                <span className={styles.swatch} style={{ background: h.value }} />{h.label}
              </button>
            ))}
            {editor.isActive('highlight') && (
              <button type="button" className={styles.colorMenuItem} onClick={() => { setHighlightMenuOpen(false); editor.chain().focus().unsetHighlight().run() }}>Bỏ tô màu</button>
            )}
          </DropdownMenu>
        </div>

        <span className={styles.divider} />

        <button type="button" className={editor.isActive({ textAlign: 'left' }) ? styles.active : ''} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Căn trái"><AlignLeft size={16} /></button>
        <button type="button" className={editor.isActive({ textAlign: 'center' }) ? styles.active : ''} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Căn giữa"><AlignCenter size={16} /></button>
        <button type="button" className={editor.isActive({ textAlign: 'right' }) ? styles.active : ''} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Căn phải"><AlignRight size={16} /></button>
        <button type="button" className={editor.isActive({ textAlign: 'justify' }) ? styles.active : ''} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Căn đều"><AlignJustify size={16} /></button>

        <span className={styles.divider} />

        <button type="button" className={editor.isActive('bulletList') ? styles.active : ''} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Danh sách"><List size={16} /></button>
        <button type="button" className={editor.isActive('orderedList') ? styles.active : ''} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Danh sách số"><ListOrdered size={16} /></button>

        <span className={styles.divider} />

        <button type="button" onClick={handlePickImage} disabled={uploading} title="Chèn ảnh">
          {uploading ? <Loader2 size={16} className={styles.spin} /> : <ImageIcon size={16} />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className={styles.hiddenFileInput} />

        {/* Callout */}
        <div className={styles.colorPickerWrap}>
          <button ref={calloutBtnRef} type="button" className={editor.isActive('calloutBox') ? styles.active : ''} onClick={() => setColorMenuOpen(v => !v)} title="Khung nổi bật">
            <Megaphone size={16} />
          </button>
          <DropdownMenu anchorRef={calloutBtnRef} open={colorMenuOpen}>
            {CALLOUT_COLORS.map(c => (
              <button key={c} type="button" className={styles.colorMenuItem} onClick={() => insertCallout(c)}>
                <span className={`${styles.swatch} ${styles['swatch_' + c]}`} />{CALLOUT_LABEL[c]}
              </button>
            ))}
            {editor.isActive('calloutBox') && (
              <button type="button" className={styles.colorMenuItem} onClick={() => { setColorMenuOpen(false); editor.chain().focus().unsetCalloutBox().run() }}>Bỏ khung</button>
            )}
          </DropdownMenu>
        </div>

        {/* Quản lý Bảng */}
        <div className={styles.colorPickerWrap}>
          <button ref={tableBtnRef} type="button" className={editor.isActive('table') ? styles.active : ''} onClick={() => setTableMenuOpen(v => !v)} title="Chèn / Quản lý Bảng">
            <TableIcon size={16} />
          </button>
          <DropdownMenu anchorRef={tableBtnRef} open={tableMenuOpen}>
            {!editor.isActive('table') ? (
              <button type="button" className={styles.colorMenuItem} onClick={() => { setTableMenuOpen(false); editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }}>
                Chèn bảng mới (3x3)
              </button>
            ) : (
              <>
                <button type="button" className={styles.colorMenuItem} onClick={() => { setTableMenuOpen(false); editor.chain().focus().addRowBefore().run(); }}>Thêm dòng phía trên</button>
                <button type="button" className={styles.colorMenuItem} onClick={() => { setTableMenuOpen(false); editor.chain().focus().addRowAfter().run(); }}>Thêm dòng phía dưới</button>
                <button type="button" className={styles.colorMenuItem} onClick={() => { setTableMenuOpen(false); editor.chain().focus().addColumnBefore().run(); }}>Thêm cột bên trái</button>
                <button type="button" className={styles.colorMenuItem} onClick={() => { setTableMenuOpen(false); editor.chain().focus().addColumnAfter().run(); }}>Thêm cột bên phải</button>
                <button type="button" className={styles.colorMenuItem} onClick={() => { setTableMenuOpen(false); editor.chain().focus().deleteRow().run(); }}>Xóa dòng</button>
                <button type="button" className={styles.colorMenuItem} onClick={() => { setTableMenuOpen(false); editor.chain().focus().deleteColumn().run(); }}>Xóa cột</button>
                <button type="button" className={styles.colorMenuItem} onClick={() => { setTableMenuOpen(false); editor.chain().focus().deleteTable().run(); }} style={{ color: '#dc2626' }}>Xóa bảng</button>
              </>
            )}
          </DropdownMenu>
        </div>

        <span className={styles.divider} />

        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác"><Undo2 size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại"><Redo2 size={16} /></button>

      </div>

      <EditorContent editor={editor} placeholder={placeholder} />

      {/* ── MODAL OVERLAY CHỈNH SỬA CẤU HÌNH HÌNH ẢNH (MODAL OVERLAY) ── */}
      {modalOpen && ReactDOM.createPortal(
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><Settings size={18} /> {modalMode === 'insert' ? 'Chèn & Cấu hình Hình ảnh' : 'Chỉnh sửa Thuộc tính Hình ảnh'}</h3>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Xem trước ảnh + Nút Thay thế ảnh khác */}
              {modalImgSrc && (
                <div className={styles.modalPreviewWrap}>
                  <img src={modalImgSrc} alt="Preview" />
                  <button
                    type="button"
                    className={styles.modalReplaceBtn}
                    onClick={() => replaceFileInputRef.current?.click()}
                    disabled={replacingImg}
                    title="Thay thế bằng ảnh khác"
                  >
                    {replacingImg ? <Loader2 size={13} className={styles.spin} /> : <RefreshCw size={13} />}
                    <span>{replacingImg ? 'Đang tải ảnh mới...' : 'Thay thế ảnh khác'}</span>
                  </button>
                  <input
                    ref={replaceFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleReplaceFileChange}
                    className={styles.hiddenFileInput}
                  />
                </div>
              )}

              {/* Ô nhập Mô tả hình ảnh (Chú thích / Alt SEO) */}
              <div className={styles.modalFormGroup}>
                <label>Mô tả hình ảnh (Chú thích / Alt SEO)</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  value={modalCaption}
                  placeholder="Nhập mô tả hình ảnh tại đây..."
                  onChange={(e) => setModalCaption(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Căn lề chữ Mô tả */}
              <div className={styles.modalFormGroup}>
                <label>Căn lề mô tả chữ</label>
                <div className={styles.modalBtnGroup}>
                  <button
                    type="button"
                    className={modalCaptionAlign === 'left' ? styles.activeBtn : ''}
                    onClick={() => setModalCaptionAlign('left')}
                  >
                    <AlignLeftIcon size={14} /> Trái
                  </button>
                  <button
                    type="button"
                    className={modalCaptionAlign === 'center' ? styles.activeBtn : ''}
                    onClick={() => setModalCaptionAlign('center')}
                  >
                    <AlignCenterIcon size={14} /> Giữa
                  </button>
                  <button
                    type="button"
                    className={modalCaptionAlign === 'right' ? styles.activeBtn : ''}
                    onClick={() => setModalCaptionAlign('right')}
                  >
                    <AlignRightIcon size={14} /> Phải
                  </button>
                </div>
              </div>

              {/* Vị trí hình ảnh */}
              <div className={styles.modalFormGroup}>
                <label>Vị trí hình ảnh</label>
                <div className={styles.modalBtnGroup}>
                  <button
                    type="button"
                    className={modalImgAlign === 'left' ? styles.activeBtn : ''}
                    onClick={() => setModalImgAlign('left')}
                  >
                    <AlignLeftIcon size={14} /> Trái
                  </button>
                  <button
                    type="button"
                    className={modalImgAlign === 'center' ? styles.activeBtn : ''}
                    onClick={() => setModalImgAlign('center')}
                  >
                    <AlignCenterIcon size={14} /> Giữa
                  </button>
                  <button
                    type="button"
                    className={modalImgAlign === 'right' ? styles.activeBtn : ''}
                    onClick={() => setModalImgAlign('right')}
                  >
                    <AlignRightIcon size={14} /> Phải
                  </button>
                </div>
              </div>

              {/* Kích thước hiển thị */}
              <div className={styles.modalFormGroup}>
                <label>Kích thước hiển thị</label>
                <div className={styles.modalBtnGroup}>
                  <button
                    type="button"
                    className={modalImgWidth === '100' ? styles.activeBtn : ''}
                    onClick={() => setModalImgWidth('100')}
                  >
                    100%
                  </button>
                  <button
                    type="button"
                    className={modalImgWidth === '75' ? styles.activeBtn : ''}
                    onClick={() => setModalImgWidth('75')}
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    className={modalImgWidth === '50' ? styles.activeBtn : ''}
                    onClick={() => setModalImgWidth('50')}
                  >
                    50%
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              {modalMode === 'edit' && (
                <button type="button" className={styles.modalDeleteBtn} onClick={handleDeleteModal}>
                  <Trash2 size={15} /> Xóa ảnh này
                </button>
              )}
              <div className={styles.rightFooterBtns}>
                <button type="button" className={styles.modalCancelBtn} onClick={() => setModalOpen(false)}>
                  Hủy
                </button>
                <button type="button" className={styles.modalSubmitBtn} onClick={handleSaveModal}>
                  <Check size={16} /> Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}
