/** @format */

import LoginComp from "@/components/login/login.comp"
import auth from "@/utils/auth/auth"
import React from "react"

function LoginPage() {
    console.log("test: " + auth.getUser())

    return (
        <div className="h-full w-full">
            <LoginComp></LoginComp>
        </div>
    )
}

export default LoginPage
