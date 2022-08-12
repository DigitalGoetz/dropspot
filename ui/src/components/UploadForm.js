import './UploadForm.css';
import React from "react";
import FileList from "./FileList";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { RuxButton, RuxButtonGroup } from '@astrouxds/react';
import { faCloudArrowUp, faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UploadForm = () => {

    const [selectedFile, setSelectedFile] = useState("");
    const [files, setFiles] = useState([]);
    const [refresh, setRefresh] = useState(true);

    const toggleRefresh = () => {
        setRefresh(!refresh);
    }

    useEffect(() => {
        const listUrl = process.env.REACT_APP_API;

        const fetchData = async () => {
            try {
                const response = await fetch(listUrl);
                const json = await response.json();
                setFiles(json);
            } catch (error) {
                console.log("error", error);
            }
        };

        fetchData();
    }, [refresh]);

    const handleFileInput = (e) => {
        setSelectedFile(e.target.files[0])
        toggleRefresh();
    }

    const findFile = () => {
        const input = document.getElementById('fileselector');
        input.click();
    }

    const submitForm = function (e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("uploadedFile", selectedFile);

        console.log("using: " + process.env.REACT_APP_API)

        axios
            .post(process.env.REACT_APP_API, formData)
            .then((res) => {
                setSelectedFile("");
                toggleRefresh();
                // const input = document.querySelector('#fileselector');
                // input.value = "";
            })
            .catch((err) => alert("File Upload Error"));
    };

    return (
        <div>
            <RuxButtonGroup>
                <RuxButton className='rux-style' onClick={findFile}>
                    <FontAwesomeIcon className='fa-icon' icon={faFile} /> Select File
                </RuxButton>

                <input
                    id='fileselector'
                    type="file"
                    name="uploadedFile"
                    onChange={handleFileInput}
                />
                <RuxButton className='rux-style' onClick={submitForm}>
                    <FontAwesomeIcon className='fa-icon' icon={faCloudArrowUp} /> Upload
                </RuxButton>

                {selectedFile !== "" && <div className='bork'>Staged File: {selectedFile.name}</div>}

            </RuxButtonGroup>



            <FileList files={files} toggleRefresh={toggleRefresh} />
        </div>

    )
}

export default UploadForm