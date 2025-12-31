import './UploadForm.css';
import React, { useEffect, useRef, useState } from "react";
import FileList from "./FileList";
import axios from 'axios';
import { RuxButton, RuxButtonGroup, RuxProgress } from '@astrouxds/react';
import { faCloudArrowUp, faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UploadForm = () => {
    const apiBase = (process.env.REACT_APP_API || "/files").replace(/\/$/, "");

    const [selectedFile, setSelectedFile] = useState("");
    const [files, setFiles] = useState([]);
    const [capacity, setCapacity] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [refresh, setRefresh] = useState(true);
    const uploadSourceRef = useRef(null);

    const toggleRefresh = () => {
        setRefresh(!refresh);
    }

    useEffect(() => {
        const listUrl = apiBase;
        const capacityUrl = `${apiBase}/capacity`;

        const fetchData = async () => {
            try {
                const [filesResponse, capacityResponse] = await Promise.all([
                    fetch(listUrl),
                    fetch(capacityUrl)
                ]);
                const filesJson = await filesResponse.json();
                setFiles(filesJson);

                if (capacityResponse.ok) {
                    const capacityJson = await capacityResponse.json();
                    setCapacity(capacityJson);
                } else {
                    setCapacity(null);
                }
            } catch (error) {
                console.log("error", error);
            }
        };

        fetchData();
    }, [refresh]);

    useEffect(() => {
        return () => {
            if (uploadSourceRef.current) {
                uploadSourceRef.current.close();
            }
        };
    }, []);

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

        if (!selectedFile) {
            return;
        }

        const formData = new FormData();
        formData.append("uploadedFile", selectedFile);
        const uploadId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        if (uploadSourceRef.current) {
            uploadSourceRef.current.close();
        }

        const progressSource = new EventSource(`${apiBase}/progress/${uploadId}`);
        uploadSourceRef.current = progressSource;
        setIsUploading(true);
        setUploadProgress({
            uploadId,
            bytesReceived: 0,
            totalBytes: selectedFile.size,
            percent: 0,
            status: 'uploading'
        });

        progressSource.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                setUploadProgress(payload);

                if (payload.status === 'complete' || payload.status === 'error') {
                    setIsUploading(false);
                    progressSource.close();
                    uploadSourceRef.current = null;
                }
            } catch (err) {
                console.log("progress parse error", err);
            }
        };

        progressSource.onerror = () => {
            setIsUploading(false);
            progressSource.close();
            uploadSourceRef.current = null;
        };

        console.log("using: " + apiBase)

        axios
            .post(`${apiBase}?uploadId=${uploadId}`, formData)
            .then(() => {
                setSelectedFile("");
                toggleRefresh();
                // const input = document.querySelector('#fileselector');
                // input.value = "";
            })
            .catch(() => alert("File Upload Error"))
            .finally(() => {
                setIsUploading(false);
                if (uploadSourceRef.current) {
                    uploadSourceRef.current.close();
                    uploadSourceRef.current = null;
                }
            });
    };

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

            {capacity && (
                <div className="capacity">
                    <div className="capacityLabel">
                        Storage remaining: {formatBytes(capacity.remainingBytes)} / {formatBytes(capacity.maxBytes)}
                    </div>
                    <RuxProgress
                        className="capacityProgress"
                        value={capacity.usedBytes}
                        max={capacity.maxBytes}
                    />
                </div>
            )}

            {isUploading && (
                <div className="uploadProgress">
                    <div className="uploadProgressLabel">
                        Uploading: {uploadProgress?.percent ?? 0}%
                        {uploadProgress?.totalBytes
                            ? ` (${formatBytes(uploadProgress.bytesReceived)} / ${formatBytes(uploadProgress.totalBytes)})`
                            : ""}
                    </div>
                    <RuxProgress
                        className="uploadProgressBar"
                        value={uploadProgress?.percent ?? 0}
                        max={100}
                    />
                </div>
            )}

            <FileList files={files} toggleRefresh={toggleRefresh} />
        </div>

    )
}

export default UploadForm
