import { useEffect, useRef, useState } from 'react'

export const useMentionEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const [candidates, setCandidates] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [showPopover, setShowPopover] = useState(false)
  const [range, setRange] = useState<Range | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [currentKeyword, setCurrentKeyword] = useState('')

  const users = [
    'alice', 'bob', 'charlie', 'david', 'eve',
    'frank', 'grace', 'hannah', 'ian', 'julia',
    'kyle', 'linda', 'michael', 'nina', 'oliver',
    'paul', 'quinn', 'rachel', 'steve', 'tina',
    '神尾'
  ]

  const updateMentionCandidates = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const currentRange = sel.getRangeAt(0)
    setRange(currentRange)

    const textNode = currentRange.startContainer
    const offset = currentRange.startOffset

    if (textNode.nodeType !== Node.TEXT_NODE) {
      setShowPopover(false)
      return
    }

    const text = textNode.textContent || ''
    const beforeCursor = text.slice(0, offset)
    const match = beforeCursor.match(/@([\w\u3040-\u30ff\u4e00-\u9faf]*)$/)

    if (match) {
      const keyword = match[1]
      setCurrentKeyword(keyword)
      const matched = users.filter(user => user.startsWith(keyword))

      if (matched.length === 0) {
        setShowPopover(false)
        return
      }

      setCandidates(matched)
      setShowPopover(true)
      setActiveIndex(0)
    } else {
      setShowPopover(false)
      setCurrentKeyword('')
    }
  }

  const handleInput = () => {
    if (isComposing) return
    updateMentionCandidates()
  }

  const insertMention = (name: string) => {
    if (!range || !editorRef.current) return

    const textNode = range.startContainer as Text
    const offset = range.startOffset
    const text = textNode.textContent || ''
    const before = text.slice(0, offset)
    const after = text.slice(offset)
    const newText = before.replace(/@([\w\u3040-\u30ff\u4e00-\u9faf]*)$/, '')

    const mentionEl = document.createElement('span')
    mentionEl.textContent = `@${name}`
    mentionEl.setAttribute('contenteditable', 'false')
    Object.assign(mentionEl.style, mentionStyle)

    const afterText = document.createTextNode(after)

    const parent = textNode.parentNode!
    parent.replaceChild(afterText, textNode)
    if (newText) {
      parent.insertBefore(document.createTextNode(newText), afterText)
    }
    parent.insertBefore(mentionEl, afterText)

    placeCaretAfter(mentionEl)
    setShowPopover(false)
    setCurrentKeyword('')
  }

  const placeCaretAfter = (node: Node) => {
    const sel = window.getSelection()
    const newRange = document.createRange()
    newRange.setStartAfter(node)
    newRange.collapse(true)
    sel?.removeAllRanges()
    sel?.addRange(newRange)
    editorRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPopover || isComposing) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % candidates.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + candidates.length) % candidates.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      insertMention(candidates[activeIndex])
    } else if (e.key === 'Escape') {
      setShowPopover(false)
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setTimeout(updateMentionCandidates, 0) // 終了後に反映
  }

  useEffect(() => {
    const container = popoverRef.current
    if (!container) return

    const activeItem = container.querySelector('[data-active="true"]') as HTMLElement | null
    if (activeItem) {
      const containerTop = container.scrollTop
      const containerBottom = containerTop + container.clientHeight
      const itemTop = activeItem.offsetTop
      const itemBottom = itemTop + activeItem.offsetHeight

      if (itemTop < containerTop) {
        container.scrollTop = itemTop
      } else if (itemBottom > containerBottom) {
        container.scrollTop = itemBottom - container.clientHeight
      }
    }
  }, [activeIndex])

  return {
    editorRef,
    popoverRef,
    candidates,
    activeIndex,
    showPopover,
    currentKeyword,
    handleInput,
    handleKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    insertMention,
  }
}

const mentionStyle = {
  background: '#e0f7fa',
  color: '#00796b',
  padding: '2px 4px',
  margin: '0 2px',
  borderRadius: '4px',
  userSelect: 'none',
} satisfies React.CSSProperties
