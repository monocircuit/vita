/** @format */

import LoginComp from "@/components/login/login.comp"
import styles from "./page.module.scss"
import Navbar from "@/components/navbar/navbar"

export default function Home() {
    return (
        <div className="h-full w-full">
            <LoginComp></LoginComp>
        </div>
    )
}
