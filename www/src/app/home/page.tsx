/** @format */

import React from "react";
import { CredentialModel } from "@/models/credential/credential.model";
import { credentialApi, fetchData } from "../../utils/pbHelper/credentials/credentials";
import HomeClient from "./client";
import PocketBase from "pocketbase";
import auth from "@/utils/pbHelper/auth/auth";

const HomePage = async () => {
    
    const test = await auth.getUser();
    
    console.log(test)
    return (
        <div className="flex flex-col">
            <HomeClient></HomeClient>
        </div>
    );
};


export default HomePage;
