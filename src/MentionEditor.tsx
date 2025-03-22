
import styled from 'styled-components'
import { useMentionEditor } from './useMentionEditor'

export default function MentionEditor() {
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
  } = useMentionEditor()

  return (
    <EditorContainer>
      {showPopover && (
        <Popover ref={popoverRef}>
          {candidates.map((user, idx) => (
            <PopoverItem
              key={user}
              data-active={idx === activeIndex}
              active={idx === activeIndex}
              onMouseDown={() => insertMention(user)}
            >
              {user}
            </PopoverItem>
          ))}
        </Popover>
      )}
      <Editor
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

// styled-components 定義

const EditorContainer = styled.div`
  position: relative;
  margin-top: 100px;
`

const Editor = styled.div`
  border: 1px solid #ccc;
  min-height: 120px;
  padding: 8px;
  border-radius: 6px;
`

const Popover = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 4px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
`

const PopoverItem = styled.div<{ active: boolean }>`
  padding: 6px 10px;
  cursor: pointer;
  background: ${({ active }) => (active ? '#e0f2f1' : 'transparent')};

  &:hover {
    background: #e0f2f1;
  }
`
