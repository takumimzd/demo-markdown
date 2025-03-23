import Mention from '@tiptap/extension-mention'
import { useMentionSuggestion } from './useMentionSuggestion'

export type User = { id: string; label: string }

const users: User[] = [
  'alice', 'bob', 'charlie', 'david', 'eve', 'frank', 'grace',
  'hannah', 'ian', 'julia', 'kyle', 'linda', 'michael', 'nina',
  'oliver', 'paul', 'quinn', 'rachel', 'steve', 'tina', '神尾',
].map((name, id) => ({ id: `${id}`, label: name }))

const mentionStyle =
  'background: #e0f7fa; color: #00796b; padding: 2px 4px; margin: 0 2px; border-radius: 4px; user-select: none;'

export const useMention = () =>
  Mention.configure({
    HTMLAttributes: {
      class: 'mention',
      style: mentionStyle,
    },
    suggestion: {
      char: '@',
      items: ({ query }: { query: string }) => {
        if (typeof query !== 'string') return []
        return users.filter(user =>
          user.label.toLowerCase().startsWith(query.toLowerCase())
        )
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      render: useMentionSuggestion,
    },
  })
