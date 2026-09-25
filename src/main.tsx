import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import App from './App'
import { StoreProvider, useStore } from './lib/store'
import { FeedbackProvider } from './components/ui/feedback'
import './index.css'

/** The preview's own "Reduce motion" setting wins over the OS default. */
function Motion({ children }: { children: ReactNode }) {
  const { state } = useStore()
  return <MotionConfig reducedMotion={state.settings.motion === 'reduced' ? 'always' : 'user'}>{children}</MotionConfig>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <Motion>
          <FeedbackProvider>
            <App />
          </FeedbackProvider>
        </Motion>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
