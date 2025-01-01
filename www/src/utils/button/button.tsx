"use client"

import React, { FunctionComponent, ReactNode } from "react"
import styles from "./button.module.scss"

interface props {
    text?: string
    filling?: boolean
    icon?: ReactNode
}

const Button: FunctionComponent<props> = (props) => {
    return (
        <div className={styles["button"]}>
            <div className={styles["button__content"]}>
                <div className={styles["button__content__text"]}>{props.text}</div>
            </div>
            <div className={styles["button__background"]}></div>
        </div>
    )
}

export default Button
