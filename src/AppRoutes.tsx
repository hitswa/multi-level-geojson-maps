import React from "react";
import { Routes, Route } from "react-router-dom";
import InteractiveMap from "./Components/InteractiveMap/InteractiveMap";

const AppRoutes = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={
                    <>
                        <InteractiveMap countryName='nepal' />
                    </>
                } />
            </Routes>
        </>
    )
}

export default AppRoutes;