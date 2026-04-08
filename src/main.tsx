import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { RouterProvider } from 'react-router'

import { ThemeProvider } from './contexts/theme-provider'
import rootRouter from './router'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { Toaster } from './shared/components/ui/sonner'
import { HelmetProvider } from 'react-helmet-async'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
      <ThemeProvider>
        <Toaster position='top-right' />
        <RouterProvider router={rootRouter}></RouterProvider>
      </ThemeProvider>
      </Provider>
    </HelmetProvider>
  </StrictMode>,
)
