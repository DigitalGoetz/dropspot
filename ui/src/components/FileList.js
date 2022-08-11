import React from "react";
import "./FileList.css"
import axios from 'axios';
import { RuxButton, RuxButtonGroup } from "@astrouxds/react";


const FileList = ({ files, toggleRefresh }) => {

    const getfile = (e) => {
        let filename = e.target.attributes.value['value'];

        axios({
            url: process.env.REACT_APP_API + "/" + filename,
            method: 'GET',
            responseType: 'blob',
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
        });
    }

    const deleteFile = (e) => {
        let filename = e.target.attributes.value['value'];

        axios({
            url: process.env.REACT_APP_API + "/" + encodeURI(filename),
            method: 'DELETE'
        }).then((response) => {
            toggleRefresh();
        });
    }

    return (
        <div className="filelist">
            {files.map(x => {
                return (
                    <div className="fileContainer" key={x}>
                        <RuxButtonGroup>
                            <p className="fileLabel">{x}</p>
                            <RuxButton value={x} onClick={getfile}>Download</RuxButton>
                            <RuxButton value={x} onClick={deleteFile}>Delete</RuxButton>
                        </RuxButtonGroup>
                    </div>
                )
            })}
        </div>
    )
}

export default FileList