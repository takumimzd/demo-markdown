import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useEditor } from './useEditor'

export function Editor() {
  const {
    editorRef,
    popoverRef,
    candidates,
    activeIndex,
    showPopover,
    handleInput,
    handleKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    insertMention,
  } = useEditor()
  const [showEmojiPanel, setShowEmojiPanel] = useState(false)
  const lastRangeRef = useRef<Range | null>(null)
  const emojiPanelRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          emojiPanelRef.current &&
          !emojiPanelRef.current.contains(e.target as Node)
        ) {
          setShowEmojiPanel(false)
        }
      }

      if (showEmojiPanel) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [showEmojiPanel])
      
    const saveCurrentRange = () => {
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        lastRangeRef.current = sel.getRangeAt(0)
      }
    }

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    editor.addEventListener('keyup', saveCurrentRange)
    editor.addEventListener('mouseup', saveCurrentRange)
    return () => {
      editor.removeEventListener('keyup', saveCurrentRange)
      editor.removeEventListener('mouseup', saveCurrentRange)
    }
  }, [editorRef])

  const handleInsertAt = () => {
    const editor = editorRef.current
    if (!editor) return

    editor.focus()
    const sel = window.getSelection()
    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null

    const isInEditor = sel && editor.contains(sel.anchorNode)
    const newRange = document.createRange()
    let atText: Text | null = null

    if (range && isInEditor) {
      range.deleteContents()
      atText = document.createTextNode('@')
      range.insertNode(atText)
      newRange.setStartAfter(atText)
    } else {
      const firstChild = editor.firstChild
      atText = document.createTextNode('@')
      if (firstChild) {
        editor.insertBefore(atText, firstChild)
      } else {
        editor.appendChild(atText)
      }
      newRange.setStartAfter(atText)
    }

    newRange.collapse(true)
    sel?.removeAllRanges()
    sel?.addRange(newRange)

    if (atText && typeof atText.textContent === 'string') {
      const syntheticRange = document.createRange()
      syntheticRange.setStart(atText, atText.length)
      syntheticRange.setEnd(atText, atText.length)
      const syntheticSel = window.getSelection()
      syntheticSel?.removeAllRanges()
      syntheticSel?.addRange(syntheticRange)
    }

    handleInput()
  }

  const handleInsertEmoji = (emoji: string) => {
    const editor = editorRef.current
    if (!editor || !lastRangeRef.current) return

    editor.focus()
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(lastRangeRef.current)

    const range = sel?.getRangeAt(0)
    if (!range) return

    range.deleteContents()
    const emojiNode = document.createTextNode(emoji)
    range.insertNode(emojiNode)

    const newRange = document.createRange()
    newRange.setStartAfter(emojiNode)
    newRange.collapse(true)
    sel?.removeAllRanges()
    sel?.addRange(newRange)

    lastRangeRef.current = newRange
    handleInput()
  }

  return (
    <EditorContainer>
      <ButtonGroup>
        <Button onClick={handleInsertAt}>@</Button>
        <Button onClick={() => setShowEmojiPanel(!showEmojiPanel)}>😊</Button>
      </ButtonGroup>

    {showEmojiPanel && (
      <EmojiPanel ref={emojiPanelRef}>
        {['😀', '😂', '😎', '😍', '😭', '👍', '🎉'].map((emoji) => (
          <EmojiItem key={emoji} onMouseDown={() => handleInsertEmoji(emoji)}>
            {emoji}
          </EmojiItem>
        ))}
      </EmojiPanel>
    )}
  {showPopover && (
    <Popover ref={popoverRef}>
      {candidates.map((user, idx) => (
        <PopoverItem
          key={user}
          data-active={idx === activeIndex}
          active={idx === activeIndex}
          onMouseDown={() => insertMention(user)}
        >
          @{user}
        </PopoverItem>
      ))}
    </Popover>
  )}

  <EditorArea
    ref={editorRef}
    contentEditable
    onInput={handleInput}
    onKeyDown={handleKeyDown}
    onCompositionStart={handleCompositionStart}
    onCompositionEnd={handleCompositionEnd}
  />
</EditorContainer>
  )
}

const EditorContainer = styled.div`
  position: relative;
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-bottom: 8px;
`

const Button = styled.button`
  padding: 4px 8px;
  font-size: 14px;
  background: #e0e7ff;
  border: none;
  border-radius: 4px;
  color: #374151;
  cursor: pointer;
  &:hover {
    background: #c7d2fe;
  }
`

const EditorArea = styled.div`
  position: relative;
  border: 1px solid #ccc;
  min-height: 120px;
  padding: 10px;
  border-radius: 6px;
  background: #fff;
  font-size: 15px;
  line-height: 1.5;
  outline: none;
  `

const Popover = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 6px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  max-height: 180px;
  overflow-y: auto;
  min-width: 140px;
  z-index: 10;
`

const PopoverItem = styled.div<{ active: boolean }>`
  padding: 6px 10px;
  font-size: 14px;
  background: ${({ active }) => (active ? '#e0f2f1' : 'transparent')};
  cursor: pointer;

  &:hover {
    background: #f0fdf4;
  }
`

const EmojiPanel = styled.div`
  position: absolute;
  top: 38px;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  padding: 6px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(28px, 1fr));
  gap: 4px;
  width: 140px;
`

const EmojiItem = styled.div`
  font-size: 18px;
  text-align: center;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  &:hover {
    background: #f3f4f6;
  }
`
