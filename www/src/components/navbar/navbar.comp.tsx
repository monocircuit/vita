import React from "react"

function Navbar() {
    return (
        <div className="bg-gray-300 border-b-black border-2 h-16 flex items-center p-4 m-[-2px] shadow-xl">
            <div>
                <img
                    className="w-12"
                    src="https://github.com/monocircuit/design/blob/main/brandings/monocircuit/Logo%20(Hopeful%20Ocean%20&%20Material%20Dark).png?raw=true"
                />
            </div>
            <div className="flex-1"></div>
            <div>test</div>
            <div className="flex-1"></div>
            <div>
                <img
                    className="w-12"
                    src="http://localhost:3000/login.svg"
                />
            </div>
        </div>
    )
}

export default Navbar
