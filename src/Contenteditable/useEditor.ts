import { useEffect, useRef, useState } from 'react'
import { useMention } from './useMention'
import { useEmoji } from './useEmoji'

export const useEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [isComposing, setIsComposing] = useState(false)

  const { convertEmojis } = useEmoji()
  const {
    candidates,
    activeIndex,
    showPopover,
    currentKeyword,
    updateMentionCandidates,
    insertMention,
    setActiveIndex,
    setShowPopover,
  } = useMention({
    onInsert: (mentionNode) => {
      placeCaretAfter(mentionNode)
    },
  })

  const handleInput = () => {
    if (isComposing) return
    updateMentionCandidates()
    if (editorRef.current) convertEmojis(editorRef.current)
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setTimeout(() => {
      updateMentionCandidates()
      if (editorRef.current) convertEmojis(editorRef.current)
    }, 0)
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

  const placeCaretAfter = (node: Node) => {
    const sel = window.getSelection()
    const newRange = document.createRange()
    newRange.setStartAfter(node)
    newRange.collapse(true)
    sel?.removeAllRanges()
    sel?.addRange(newRange)
    editorRef.current?.focus()
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
