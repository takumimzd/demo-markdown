import { Editor } from './Editor'
import styled from 'styled-components'

function App() {
  return (
    <AppContainer>
      <Title>メンション & 絵文字対応エディタ</Title>
      <Description>
        <SectionTitle>🧑‍🤝‍🧑 メンション機能</SectionTitle>
        <ul>
          <li>「<code>@</code>」を入力するとユーザー候補が表示されます。</li>
          <li>上下キーで選択し、<code>Enter</code> でメンションを挿入できます。</li>
          <li>挿入されたメンションはスタイル付きで編集不可です。</li>
          <li>右上の「<strong>@ボタン</strong>」でもメンション挿入が可能です。</li>
        </ul>

        <SectionTitle>😊 絵文字機能</SectionTitle>
        <ul>
          <li>「<code>:smile:</code>」など、コロンで囲まれた文字列は絵文字にリアルタイム変換されます。</li>
          <li>登録済みの絵文字名のみ変換対象です。</li>
          <li>右上の「<strong>😊ボタン</strong>」から絵文字を選んで挿入することもできます。</li>
          <li>連続クリックしてもキャレットがずれず、正しい位置に絵文字が挿入されます。</li>
        </ul>
      </Description>
      <Editor />
    </AppContainer>
  )
}

const AppContainer = styled.div`
  padding: 2rem;
  max-width: 720px;
  margin: 0 auto;
`

const Title = styled.h2`
  font-size: 20px;
  margin-bottom: 1rem;
`

const Description = styled.div`
  font-size: 14px;
  color: #444;
  line-height: 1.7;
  margin-bottom: 2rem;

  ul {
    margin: 0.5rem 0 1.5rem 1.2rem;
    padding-left: 1rem;
    list-style: disc;
  }

  code {
    background: #f3f3f3;
    padding: 1px 4px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 13px;
  }
`

const SectionTitle = styled.p`
  font-weight: bold;
  margin-top: 1.2rem;
  margin-bottom: 0.4rem;
`

export default App
