"use client";

import VitaForm from "@/components/common/VitaForm";
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
import useOwnProfile from "@/shared/supabase/tables/profiles/read/useOwnProfile";
import useOwnVitas from "@/shared/supabase/tables/vitas/$read/useOwnVitas";

interface Props {}

const Vitas = (props: Props) => {
  /** ANCHOR: Data */
  const { data: ownProfile } = useOwnProfile();
  const { data: ownVitas } = useOwnVitas();

  /** ANCHOR: Router */
  const router = useRouter();

  /** ANCHOR: State */
  const [isAddPopoverActive, setIsAddPopoverActive] = useState(false);

  useEffect(() => {
    console.log("vitas", ownVitas);
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
          {ownVitas?.map((vita, key) => (
            <TableRow key={key}>
              <TableCell>{vita.name}</TableCell>
              <TableCell>{vita.scope}</TableCell>
              <TableCell>
                <Button
                  className="w-[60px] h-[20px] overflow-hidden monolithium-border"
                  onClick={() => {
                    if (ownProfile && ownVitas) {
                      router.push(
                        `/editor/${ownProfile.id}/${ownVitas[key].name}`,
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
