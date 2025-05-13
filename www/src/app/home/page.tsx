/** @format */

import React from "react";
import { CredentialModel } from "@/models/credential/credential.model";
import { credentialApi, fetchData } from "../../utils/pocketbase/credentials/credentials";
import HomeClient from "./client";
import PocketBase from "pocketbase";

const HomePage = async () => {
    

    

    return (
        <div className="flex flex-col">
            <div className=" flex flex-row">
                <div>user: </div> <div></div>
            </div>
            <HomeClient></HomeClient>
        </div>
    );
};


export default HomePage;
