"use client";

import VitaForm from "@/components/common/VitaForm";
import { useOwnDynamicVitas } from "@/utils/supabase/api/vitas/readOwnDynamicVitas";
import { Button, Popover } from "@monolithium/next/components";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useOwnProfileData } from "@/utils/supabase/api/profiles/getOwnProfile";

interface Props {}

const Vitas = (props: Props) => {
  /** ANCHOR: Data */
  const { ownProfile } = useOwnProfileData();
  const { ownDynamicVitas } = useOwnDynamicVitas();

  /** ANCHOR: Router */
  const router = useRouter();

  /** ANCHOR: State */
  const [isAddPopoverActive, setIsAddPopoverActive] = useState(false);

  useEffect(() => {
    console.log(ownDynamicVitas);
  });

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Scope</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ownDynamicVitas?.map((vita, key) => (
            <TableRow key={key}>
              <TableCell>{vita.name}</TableCell>
              <TableCell>{vita.scope}</TableCell>
              <TableCell>
                <Button
                  className="w-[60px] h-[20px] overflow-hidden monolithium-border"
                  onClick={() => {
                    if (ownProfile && ownDynamicVitas) {
                      router.push(
                        `/editor/${ownProfile.id}/${ownDynamicVitas[key].name}`,
                      );
                    }
                  }}
                >
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Popover
        content={<VitaForm />}
        className="w-[300px] h-[500px] border-solid border-secondary border-(length:--stroke) bg-primary"
        config={{
          isConnected: true,
          isClosableByEmptyClick: true,
          isDraggable: true,
        }}
        shouldRender={isAddPopoverActive}
      >
        <Button
          text="add"
          className="h-[30px] w-[30px] border-solid border-secondary border-(length:--stroke)"
          onClick={() => setIsAddPopoverActive(!isAddPopoverActive)}
        />
      </Popover>
    </div>
  );
};

export default Vitas;
