import React from "react";
import UploadForm from "./components/UploadForm";
import Header from "./components/Header";
import './App.css';
import '@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css'

const App = () => {

  return (
    <div className="main">
      <Header />
      <UploadForm />
    </div>
  )
}

export default App