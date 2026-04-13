import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
 import StarMap from './StarMap'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StarMap />
  </StrictMode>,
)
