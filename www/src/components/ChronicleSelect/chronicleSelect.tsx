import { Chronicle, ChronicleOverhead } from '@/utils/schemas/Chronicle';
import { getChronicles } from '@/utils/supabase/api/chronicle/readOwnChronicles';
import React, { useEffect, useState } from 'react'
import Card from '../common/Card';
import { Button, Popover, Scrollable } from "@monolithium/next/components";
import CardText from '../common/Card/CardText';
import classNames from "classnames"

interface props {
    submitFunction: (e: (Chronicle & ChronicleOverhead)[]) => void
}

function ChronicleSelect(props: props) {
    const [chronicles, setChronicles] = useState<(Chronicle & ChronicleOverhead)[] | null>();
    const [selectedChronicles, setSelectedChronicles] = useState<(Chronicle & ChronicleOverhead)[]>([])



    useEffect(() => {
        getChronicles().then(data => {
            setChronicles(data)
        })
    }, [])

    console.log(selectedChronicles)


    const isIncluded = (id: number) => {
        return selectedChronicles.some(e => e.id === id)
    }

    const handleClick = (id: number) => {
        setSelectedChronicles(prev => {
            const isSelected = prev?.some(item => item.id === id);

            if (isSelected) {
                // Remove if already selected
                return prev?.filter(item => item.id !== id);

            } else {
                // Add if not selected
                const chronicleToAdd = chronicles?.find(item => item.id === id);
                if (chronicleToAdd) {
                    return [...prev, chronicleToAdd];
                }
                return prev; // in case not found
            }
        });
    }

    return (
        <div className='monolithium-border h-[700px]' >
            <Scrollable shouldScrollY >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 m-2 ">

                    {!chronicles ? (<div>isLoading</div>) : chronicles.map(element =>

                        <div className={isIncluded(element.id)? "flex-grow min-w-[100px] p-2  overflow-hidden border-4 border-green-600 basis-0 h-[300px]": "flex-grow min-w-[100px] p-2  overflow-hidden monolithium-border  basis-0 h-[300px]"}>
                            <Button onClick={() => handleClick(element.id)}>
                                <div className="font-bold text-md mb-2 rounded-20 bg-gray-300 text-center">
                                    {element.title}
                                </div>
                                <div className='h-full'>

                                    <div  >{element.description}</div>
                                </div>

                            </Button>
                        </div>


                    )}

                </div>
            </Scrollable>
            <div className='h-[100px]'>
                <Button className='h-20 p-2 ' onClick={() => props.submitFunction(selectedChronicles)}>Submit</Button>
            </div>
        </div>

    )
}

export default ChronicleSelect
