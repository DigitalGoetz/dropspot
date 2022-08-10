import './UploadForm.css';
import React from "react";
import { useEffect, useRef } from 'react';
import { RuxInput, RuxButton } from "@astrouxds/react"

const UploadForm = () => {

    const refContainer = useRef("uploadForm");

    useEffect(() => {
        // 👇️ this is reference to input element
        console.log(refContainer.current);

        refContainer.current.focus();
    }, []);

    const runthingy = () => {
        console.log(process.env.REACT_APP_TEST)
    }

    return (


        <div>

            <RuxButton onClick={() => runthingy()}>
                Ding
            </RuxButton>

            <form ref={refContainer} id='uploadForm' action='http://localhost:3000/upload' method='post' encType="multipart/form-data">

                <RuxInput
                    type="file"
                    name="sampleFile"
                />
                <RuxInput
                    type="submit"
                    value="Upload File"
                />


            </form>


        </div>




    )
}

export default UploadForm