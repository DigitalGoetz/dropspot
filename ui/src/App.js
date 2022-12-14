import React from "react";
import { BrowserRouter } from 'react-router-dom'
import UploadForm from "./components/UploadForm";
import Header from "./components/Header";
import './App.css';
import '@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css'

const App = () => {

  return (
    <BrowserRouter basename='/web'>
      <div className="main">
        <Header />
        <UploadForm />
      </div>
    </BrowserRouter>

  )
}

export default App