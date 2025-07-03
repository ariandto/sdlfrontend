import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);



registerSW({
  onNeedRefresh() {
    console.log('Versi baru tersedia')
  },
  onOfflineReady() {
    console.log('Siap digunakan offline')
  }
})
