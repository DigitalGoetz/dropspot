import React from "react";
import UploadForm from "./components/UploadForm";
import Header from "./components/Header";
import FileList from "./components/FileList";
import './App.css';
import '@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css'

const App = () => {

    return (
        <div className="main">
            <Header />
            <UploadForm />
            <FileList />

        </div>
    )
}

export default App