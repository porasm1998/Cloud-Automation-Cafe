import React from 'react'
import Header from "../Header";
export default function Output_header() {
    return (
        <div>
            <Header/>
            <hr
                style={{

                    backgroundColor: "black",
                    opacity: .1

                }}

            />
            <h4 className="text-center">Output</h4>
            <hr
                style={{

                    backgroundColor: "black",
                    opacity: .1

                }}

            />

        </div>
    )
}
