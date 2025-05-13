"use client";

import Card from "@/components/Card/Card";
import { CredentialModel } from "@/models/credential/credential.model";
import auth from "@/utils/pocketbase/auth/auth";
import credentialApi, {
  fetchData,
} from "@/utils/pocketbase/credentials/credentials";
import { RecordModel } from "pocketbase";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
interface props {
  datas: RecordModel[] | null;
}

const HomeClient: () => React.JSX.Element = () => {
  const { register, handleSubmit } = useForm<CredentialModel>();
  const [Model, setModel] = useState<RecordModel[] | null>();
  const [boolean, setBoolean] = useState<boolean>(false);

  const onSubmit = (data: CredentialModel) => {
    data.startDate = new Date(data.startDate);
    data.endDate = new Date(data.endDate);
    credentialApi.createCredentials(data);
  };

  useEffect(() => {
    async function fetchPosts() {
      const test = await credentialApi.getCredentials();
      console.log("Mango. " + test);
      setModel(test);
    }
    fetchPosts();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("title", { required: true })} placeholder="Title" />
        <input {...register("description")} placeholder="Description" />
        <input {...register("type", { required: true })} placeholder="Type" />
        <input type="date" {...register("startDate", { required: true })} />
        <input type="date" {...register("endDate", { required: true })} />
        <button type="submit">Submit</button>
      </form>
      <div className="flex flex-col ">
        <div className="flex w-full justify-center ">
          <div className="grid grid-cols-4 gap-4 w-[80%]">
            {Model ? (
              Model.map(e => (
                <Card key={e.id} title={e.title}>
                  {e.de}
                </Card>
              ))
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() =>
          boolean == false ? setBoolean(true) : setBoolean(false)
        }
      >
        haallo{" "}
      </button>
    </div>
  );
};

export default HomeClient;
