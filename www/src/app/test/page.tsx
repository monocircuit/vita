/** @format */


import LoginComp from "@/components/login/login.comp"
import { usePocket } from "@/context/pocket.context"
import React from "react"

function TestPage() {
    const { user } = usePocket()
    return (
        <div className="h-full w-full">
            <div>Hallo</div>
        </div>
    )
}

export default TestPage
