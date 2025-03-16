/** @format */

"use client"

import auth from "@/utils/auth/auth"
import React from "react"

console.log(auth.getUser())


const HomePage = () => {
    return (
        <div className="flex flex-col">
            <div className=" flex flex-row">
                <div>user: </div> <div></div>
            </div>
            <button
                onClick={() => {
                    auth.logout()
                }}
            >
                Fick die Dicken
            </button>
        </div>
    )
}

export default HomePage
