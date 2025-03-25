"use client";

import Card from "@/components/card/card.component";
import { CredentialModel } from "@/models/credential/credential.model";
import auth from "@/utils/pbHelper/auth/auth";
import credentialApi, { fetchData } from "@/utils/pbHelper/credentials/credentials";
import Drop from "@/utils/ui/drop/drop";
import Input from "@/utils/ui/input/input";
import { RecordModel } from "pocketbase";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import scss from "@/app/home/home.module.scss";
import Button from "@/utils/ui/button/button";
import Loader from "@/utils/ui/loader/loader";
interface props {
    datas: RecordModel[] | null;
}

const HomeClient: () => React.JSX.Element = () => {
    const { register, handleSubmit } = useForm<CredentialModel>();
    const [Model, setModel] = useState<RecordModel[] | null>();
    const [boolean, setBoolean] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>();

    const onSubmit = (data: CredentialModel) => {
        data.startDate = new Date(data.startDate);
        data.endDate = new Date(data.endDate);
        credentialApi.createCredentials(data);
    };

    useEffect(() => {
        async function fetchPosts() {
            const test = await credentialApi.getCredentials();
            console.log(test);
            setModel(test);
        }
        fetchPosts();
        setUserName(auth.getUser()?.name);
    }, []);

    const handle = (e: string) => {
        console.log(credentialApi.getCredentialById(e));
    };
    return (
        <div>
            <div className={scss["signin"]}>
                <div className={scss["signin__header"]}>
                    <div className={scss["signin__header__title"]}>
                        <div className={scss["signin__header__title__icon"]}></div>
                        <div className={scss["signin__header__title__text"]}>Overview</div>
                    </div>
                </div>
                <div>user: </div>
                <div>{userName} </div>
                <div className={scss["signin__body"]}>
                    <form onSubmit={handleSubmit(onSubmit)} className={scss["signin__body__form"]}>
                        <Input
                            className={scss["signin__body__form__input__username"]}
                            register={register("title", { required: true })}
                            placeholder="Title"
                            type="string"
                        />
                        <Input
                            className={scss["signin__body__form__input__username"]}
                            register={register("description")}
                            placeholder="Description"
                            type="string"
                        />
                        <Input
                            className={scss["signin__body__form__input__username"]}
                            register={register("type", { required: true })}
                            placeholder="Type"
                            type="string"
                        />
                        <Input
                            className={scss["signin__body__form__input__username"]}
                            type="date"
                            register={register("startDate", { required: true })}
                            placeholder="StartDate"
                        />
                        <Input
                            className={scss["signin__body__form__input__username"]}
                            type="date"
                            register={register("endDate", { required: true })}
                            placeholder="EndDate"
                        />
                        <Button formType="submit" className={scss["signin__body__form__submit"]}>
                            Submit
                        </Button>
                    </form>
                </div>
            </div>
            <div className="w-full">
                <Loader />

            </div>

            <div className="flex flex-col ">
                <div className="flex w-full justify-center ">
                    <div className="grid grid-cols-4 gap-4 w-[80%]">
                        {Model ? (
                            Model.map((e) => (
                                <Card
                                    key={e.id}
                                    title={e.title}
                                    onClick={() => {
                                        handle(e.id);
                                    }}
                                >
                                    <div>{e.description}</div>
                                </Card>
                            ))
                        ) : (
                            <Loader />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeClient;
