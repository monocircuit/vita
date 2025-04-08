import { CredentialForTreeModel } from "@/models/credential/credential.model";
import { TreeModel } from "@/models/tree/tree.model";
import auth from "@/utils/pbHelper/auth/auth";
import credentialApi from "@/utils/pbHelper/credentials/credentials";
import Box from "@/utils/ui/box/box";
import Input from "@/utils/ui/input/input";
import { produce } from "immer";
import { RecordModel } from "pocketbase";
import React, { useEffect, useState } from "react";
import { DndContext, KeyboardSensor, MeasuringStrategy, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import Card from "@/utils/ui/card/card.component";
import Droppable from "@/utils/ui/droppable/Droppable";
import ScrollableCardGrid from "@/utils/ui/grids/scrollablegrid/scrollablegrid";
import { adjustScale, rectIntersection } from "@dnd-kit/core/dist/utilities";

function CredentialAddOrRemoveFromTreeCard() {
    const [credentials, setCredentials] = useState<RecordModel[]>();
    const [credentialsTrimmed, setCredentialsTrimmed] = useState<CredentialForTreeModel[]>([]);

    const [tree, setTree] = useState<TreeModel>({ id: "", user: "", credentials: [] });
    const [activeId, setActiveId] = useState<string>();

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
                <DndContext autoScroll={false}>
                    <div className="flex flex-row gap-10  items-center overflow-x-visible h-full">
                        {credentials?.length ? (
                            <SortableContext items={credentials} strategy={rectSortingStrategy}>
                                <ScrollableCardGrid className="flex flex-1 p-6 overflow-auto max-h-[400px] grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 ">
                                    {credentials.map((item: RecordModel) => (
                                        <Card
                                            key={item.id}
                                            id={item.id}
                                            title={item.title}
                                            className="p-1 bg-white shadow rounded-lg h-[150px]"
                                        >
                                            {item.title}
                                        </Card>
                                    ))}
                                </ScrollableCardGrid>
                            </SortableContext>
                        ) : (
                            <div className="text-center col-span-full">No items available</div>
                        )}
                    </div>
                    <div className="flex flex-row gap-10  items-center overflow-x-visible h-full">
                        {tree?.credentials.length ? (
                            <SortableContext items={[]} strategy={rectSortingStrategy}>
                                <ScrollableCardGrid className="flex flex-1 p-6 overflow-auto max-h-[400px] grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 ">
                                    <div>Hallo</div>
                                </ScrollableCardGrid>
                            </SortableContext>
                        ) : (
                            <div className="text-center col-span-full">No items available</div>
                        )}
                    </div>
                </DndContext>
            </Box>
        </>
    );
    const moveBetweenContainers = (
        items: { [x: string]: any; },
        activeContainer: string | number,
        activeIndex: any,
        overContainer: string | number,
        overIndex: any,
        item: any
      ) => {
        return {
          ...items,
          [activeContainer]: removeAtIndex(items[activeContainer], activeIndex),
          [overContainer]: insertAtIndex(items[overContainer], overIndex, item)
        };
      };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragOver = ({ over, active }) => {
        const overId = over?.id;

        if (!overId) {
            return;
        }

        const activeContainer = active.data.current.sortable.containerId;
        const overContainer = over.data.current?.sortable.containerId;

        if (!overContainer) {
            return;
        }

        if (activeContainer !== overContainer) {
            setItems((items) => {
                const activeIndex = active.data.current.sortable.index;
                const overIndex = over.data.current?.sortable.index || 0;

                return moveBetweenContainers(
                    items,
                    activeContainer,
                    activeIndex,
                    overContainer,
                    overIndex,
                    active.id
                );
            });
        }
    };
}

export default CredentialAddOrRemoveFromTreeCard;
