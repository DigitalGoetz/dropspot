import './UploadForm.css';
import React from "react";
import FileList from "./FileList";
import { useState, useEffect } from 'react';
import axios from 'axios';

const UploadForm = () => {

    // const refContainer = useRef("uploadForm");
    const [selectedFile, setSelectedFile] = useState(null);
    const [files, setFiles] = useState([]);


    useEffect(() => {
        const listUrl = process.env.REACT_APP_API;

        const fetchData = async () => {
            try {
                const response = await fetch(listUrl);
                const json = await response.json();
                setFiles(json);
                console.log(files)
            } catch (error) {
                console.log("error", error);
            }
        };

        fetchData();
    }, [selectedFile]);

    const handleFileInput = (e) => {
        setSelectedFile(e.target.files[0])
    }

    const submitForm = function (e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("uploadedFile", selectedFile);

        axios
            .post(process.env.REACT_APP_API, formData)
            .then((res) => {
                setSelectedFile(null);
                alert("File Uploaded Successfully")
            })
            .catch((err) => alert("File Upload Error"));
    };

    return (
        <div>
            <form>
                <input
                    type="file"
                    name="uploadedFile"
                    onChange={handleFileInput}
                />
                <button type="submit" onClick={submitForm}>Submit</button>

            </form>

            <FileList files={files} setFiles={setFiles} />
        </div>

    )
}

export default UploadForm