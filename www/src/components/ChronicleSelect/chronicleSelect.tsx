import { Chronicle } from '@/utils/schemas/Chronicle';
import { getChronicles } from '@/utils/supabase/api/chronicle/readOwnChronicles';
import React, { useEffect, useState } from 'react'
import Card from '../common/Card';
import { Button, Popover } from "@monolithium/next/components";

function ChronicleSelect() {
    const [chronicles, setChronicles] = useState<Chronicle[] | null>();
    const [selectedChronicles, setSelectedChronicles] = useState<Chronicle[]>([])

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
                console.log("included and now removed")
                return prev?.filter(item => item.id !== id);

            } else {
                // Add if not selected
                console.log("not included and now added")
                const chronicleToAdd = chronicles?.find(item => item.id === id);
                if (chronicleToAdd) {
                    return [...prev, chronicleToAdd];
                }
                return prev; // in case not found
            }
        });
    }


    return (
        <div className='grid grid-cols-4 '>
            {!chronicles ? (<div>isLoading</div>) : chronicles.map(element =>
                <Button className="border m-2 h-40 " key={element.id} onClick={() => handleClick(element.id)}>
                    <div>{element.title}</div>
                    <div>test</div>
                </Button>
            )}
        </div>
    )
}

export default ChronicleSelect