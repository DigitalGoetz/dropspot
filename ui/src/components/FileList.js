import React, { useState } from "react";
import "./FileList.css"
import axios from 'axios';
import { RuxButton, RuxButtonGroup, RuxDialog } from "@astrouxds/react";


const formatBytes = (bytes) => {
    if (typeof bytes !== 'number' || Number.isNaN(bytes)) {
        return "";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ["KB", "MB", "GB", "TB"];
    let size = bytes / 1024;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

const FileList = ({ files, toggleRefresh }) => {
    const apiBase = (process.env.REACT_APP_API || "/files").replace(/\/$/, "");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState("");
    const normalizedFiles = files.map((file) => (
        typeof file === "string" ? { name: file } : file
    ));

    const getfile = (filename) => {
        axios({
            url: apiBase + "/" + filename,
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

    const deleteFile = (filename) => {
        axios({
            url: apiBase + "/" + encodeURI(filename),
            method: 'DELETE'
        }).then(() => {
            toggleRefresh();
        });
    }

    const requestDelete = (filename) => {
        setPendingDelete(filename);
        setIsDialogOpen(true);
    }

    const handleDialogClosed = (event) => {
        const confirmed = event.detail === true || event.detail === "true";
        const filename = pendingDelete;

        setIsDialogOpen(false);
        setPendingDelete("");

        if (confirmed && filename) {
            deleteFile(filename);
        }
    }

    return (
        <div className="filelist">
            {normalizedFiles.map((file) => {
                const displaySize = formatBytes(file.size);
                return (
                    <div className="fileContainer" key={file.name}>
                        <RuxButtonGroup>
                            <p className="fileLabel">
                                {file.name}
                                {displaySize && <span className="fileSize">({displaySize})</span>}
                            </p>
                            <RuxButton value={file.name} onClick={() => getfile(file.name)}>Download</RuxButton>
                            <RuxButton value={file.name} onClick={() => requestDelete(file.name)}>Delete</RuxButton>
                        </RuxButtonGroup>
                    </div>
                )
            })}
            <RuxDialog
                open={isDialogOpen}
                modalTitle="Delete file?"
                modalMessage={pendingDelete ? `Delete ${pendingDelete}? This cannot be undone.` : "Delete this file? This cannot be undone."}
                confirmText="Delete"
                denyText="Cancel"
                onRuxdialogclosed={handleDialogClosed}
            />
        </div>
    )
}

export default FileList
