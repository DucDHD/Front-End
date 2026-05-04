//import React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import ReactDOM from 'react-dom/client'
import App from '~/App.jsx'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import theme from '~/theme.js'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ConfirmProvider } from 'material-ui-confirm'
import { store } from '~/redux/store'
import { Provider } from 'react-redux'

// config react router dom with browserRouter
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename='/' >
    <Provider store={store} >
      <CssVarsProvider theme={theme}>
        <ConfirmProvider defaultOptions={{
          allowClose: false,
          dialogProps: { maxWidth: 'xs' },
          cancellationButtonProps: { color: 'inherit' },
          confirmationButtonProps: { color: 'warning', variant: 'outlined' }
        }} >
          <CssBaseline />
          <App />
          <ToastContainer position='bottom-left' theme='colored' />
        </ConfirmProvider>
      </CssVarsProvider>
    </Provider>
  </BrowserRouter>
)
