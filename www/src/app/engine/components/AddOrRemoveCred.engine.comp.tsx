import { CredentialForTreeModel } from "@/models/credential/credential.model";
import { TreeModel } from "@/models/tree/tree.model";
import auth from "@/utils/pbHelper/auth/auth";
import credentialApi from "@/utils/pbHelper/credentials/credentials";
import Box from "@/utils/ui/box/box";
import Input from "@/utils/ui/input/input";
import { produce } from "immer";
import { RecordModel } from "pocketbase";
import React, { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import Card from "@/utils/ui/card/card.component";
import Droppable from "@/utils/ui/droppable/Droppable";
import ScrollableCardGrid from "@/utils/ui/grids/scrollablegrid/scrollablegrid";

function CredentialAddOrRemoveFromTreeCard() {
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

    //
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

    return (
        <>
            <Box className="w-[80%] min-w-[500px]">
                <DndContext>
                    <div className="flex flex-row max-h-[400px] items-center">
                        <ScrollableCardGrid className="w-[50%] grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" items={credentials} />
                        <Droppable className="flex  " key={"j"}>
                            <div>Hallo</div>
                        </Droppable>
                    </div>
                </DndContext>
            </Box>
        </>
    );
}

export default CredentialAddOrRemoveFromTreeCard;
