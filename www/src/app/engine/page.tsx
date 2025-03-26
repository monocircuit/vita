"use client";

import React, { useEffect, useRef, useState } from "react";
import Two from "two.js";

import scss from "./page.module.scss";
import displayBezierControls from "@/utils/engine/displayBezierControls";
import credentialApi from "@/utils/pbHelper/credentials/credentials";
import { RecordModel } from "pocketbase";
import { TreeModel } from "@/models/tree/tree.model";
import { produce } from "immer";
import auth from "@/utils/pbHelper/auth/auth";
import { CredentialForTreeModel, CredentialModel } from "@/models/credential/credential.model";
import Popup from "@/utils/ui/popup/popup";
import CredentialAddOrRemoveFromTreeCard from "./components/AddOrRemoveCred.engine.comp";
import Modal from "@/utils/ui/modal/modal";

const Engine = () => {
    const [credentials, setCredentials] = useState<RecordModel[]>();
    const [credentialsTrimmed, setCredentialsTrimmed] = useState<CredentialForTreeModel[]>([]);

    const [tree, setTree] = useState<TreeModel>({ id: "", user: "", credentials: [] });

    //Fetching Logic:
    useEffect(() => {
        //Get All Credentials of User
        fetchPosts();
        async function fetchPosts() {
            const credentialsFetched = await credentialApi.getCredentials();
            setCredentials(credentialsFetched);
        }
    }, []);

    useEffect(() => {
        let TempArrayForCredentials: CredentialForTreeModel[] = [];

        if (credentials) {
            credentials.forEach((e) => {
                TempArrayForCredentials.push({ id: e.id, priority: 1 });
            });
        }
        setCredentialsTrimmed(TempArrayForCredentials);
    }, [credentials]);

    useEffect(() => {
        setTree(
            produce((draft) => {
                draft.user = auth.getUser()!.id;
                draft.credentials = credentialsTrimmed;
            })
        );
    }, [credentialsTrimmed]);

    //Two JS Logic :
    const engine = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!engine.current) return;
        const two = new Two({
            fullscreen: true,
            type: Two.Types.svg,
        }).appendTo(engine.current);

        const anchors = [
            new Two.Anchor(
                100,
                300, // Startpunkt
                0,
                0, // Kontrollpunkt 1
                400,
                500, // Kontrollpunkt 2
                Two.Commands.curve // Bezier-Befehl
            ),
            new Two.Anchor(
                700,
                30, // Endpunkt
                0,
                0, // Kontrollpunkt 1
                0,
                0, // Kontrollpunkt 2
                Two.Commands.curve // Bezier-Befehl
            ),
        ];

        anchors.forEach((anchor) => (anchor.relative = false));

        const path = new Two.Path(anchors, false, false, true);
        path.stroke = "#000";
        path.linewidth = 2;
        path.noFill();
        displayBezierControls(two, path);
        two.add(path);

        two.update();
    }, []);
    //<div className={scss["engine"]} ref={engine}></div>
    return (
        <div className="w-full h-full">
            <Modal className={"flex justify-center items-center select-none"}>
                <CredentialAddOrRemoveFromTreeCard />
            </Modal>
        </div>
    );
};

export default Engine;
