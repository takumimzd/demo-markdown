import { useEditor as useTiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEmoji } from './useEmoji'
import { useMention } from './Mention/useMention'

export const useEditor = (onUpdate: () => void) => {
  const emoji = useEmoji()
  const mention = useMention()

  return useTiptapEditor({
    extensions: [StarterKit, emoji, mention],
    onUpdate,
    content: '<p></p>',
  })
}
