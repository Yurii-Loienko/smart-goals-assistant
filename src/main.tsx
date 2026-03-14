import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import './index.css'
import App from './App'

const amplifyFiles = import.meta.glob<{ default: Record<string, unknown> }>('../amplify_outputs.json', { eager: true })
const outputs = amplifyFiles['../amplify_outputs.json']
if (outputs) {
  Amplify.configure(outputs.default as Parameters<typeof Amplify.configure>[0])
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
