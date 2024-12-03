import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './App.tsx'
import { ConfigProvider } from 'antd'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <ConfigProvider theme={{
    token: {
      fontFamily: 'DM Sans'
    }
   }}>
     <AppRouter />
   </ConfigProvider>
  </StrictMode>,
)
