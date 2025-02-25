import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 启动React应用
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    //Argument of type 'Element' is not assignable to parameter of type 'ReactNode'. Property 'children' is missing in type 'ReactElement<any, any>' but required in type 'ReactPortal'.ts(2345)
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found!');
}