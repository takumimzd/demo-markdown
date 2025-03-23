import { useState } from 'react'

export const useMention = (options: { onInsert: (mentionNode: Node) => void }) => {
  const [candidates, setCandidates] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [showPopover, setShowPopover] = useState(false)
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [range, setRange] = useState<Range | null>(null)

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

  const insertMention = (name: string) => {
    if (!range) return

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
    parent.insertBefore(document.createTextNode(' '), afterText) // ← スペース追加

    options.onInsert(mentionEl)
    setShowPopover(false)
    setCurrentKeyword('')
  }

  return {
    candidates,
    activeIndex,
    showPopover,
    currentKeyword,
    updateMentionCandidates,
    insertMention,
    setActiveIndex,
    setShowPopover,
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
