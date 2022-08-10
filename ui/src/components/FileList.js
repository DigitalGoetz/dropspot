import React from "react";
import "./FileList.css"
import axios from 'axios';


const FileList = ({ files }) => {

    const getfile = (e) => {
        let filename = e.target.innerText;

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

    return (
        <div className="filelist">
            {files.map(x => {
                return <p key={x} onClick={getfile}>{x}</p>
            })}
        </div>
    )
}

export default FileList