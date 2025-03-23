import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorContent } from '@tiptap/react'
import { useEditor } from './useEditor'
import styled, { createGlobalStyle } from 'styled-components'

export const Editor = () => {
  const lastRangeRef = useRef<Range | null>(null)
  const [showEmojiPanel, setShowEmojiPanel] = useState(false)

  const editor = useEditor(() => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      lastRangeRef.current = selection.getRangeAt(0)
    }
  })

  const restoreRangeAndFocus = useCallback(() => {
    if (!editor || !lastRangeRef.current) return
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(lastRangeRef.current)
    editor.commands.focus()
  }, [editor])

  const insertEmoji = useCallback((emoji: string) => {
    restoreRangeAndFocus()
    editor?.chain().insertContent(emoji).focus().run()
  }, [editor, restoreRangeAndFocus])

  const insertAt = () => {
    restoreRangeAndFocus()
    editor?.chain().insertContent('@').focus().run()
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const panel = document.getElementById('emoji-panel')
      if (panel && !panel.contains(e.target as Node)) {
        setShowEmojiPanel(false)
      }
    }
    if (showEmojiPanel) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showEmojiPanel])

  return (
    <EditorContainer>
      <ButtonGroup>
        <Button onClick={insertAt}>@</Button>
        <Button onClick={() => setShowEmojiPanel(v => !v)}>😊</Button>
      </ButtonGroup>
      {showEmojiPanel && (
        <EmojiPanel id="emoji-panel">
          {['😄', '😂', '😎', '😍', '😭', '👍', '🎉'].map(emoji => (
            <EmojiItem key={emoji} onMouseDown={() => insertEmoji(emoji)}>
              {emoji}
            </EmojiItem>
          ))}
        </EmojiPanel>
      )}
      <GlobalStyle />
      <StyledEditorContent editor={editor} />
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

const StyledEditorContent = styled(EditorContent)``

const GlobalStyle = createGlobalStyle`
  .ProseMirror {
    border: 1px solid #ccc;
    min-height: 120px;
    padding: 10px;
    border-radius: 6px;
    background: #fff;
    font-size: 15px;
    line-height: 1.5;
    outline: none;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  .tiptap-popover {
    background: #ffffff;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    max-height: 180px;
    overflow-y: auto;
    min-width: 140px;
    padding: 4px 0;
    z-index: 9999;
  }
  .tiptap-popover-item {
    padding: 6px 10px;
    font-size: 14px;
    cursor: pointer;
    color: #111827;
    background-color: #ffffff;
  }
  .tiptap-popover-item:hover {
    background-color: #e0f2f1;
  }
`
