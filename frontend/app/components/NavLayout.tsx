"use client"
import React, { ReactNode } from 'react';
import HoverDrawer from './HoverDrawer'; // Your NavBar component

type LayoutProps = {
    children: ReactNode;
};

const NavLayout = ({ children }: LayoutProps) => {
    return (
        <div style={{ position: 'relative' }}>
            <HoverDrawer />
            <main>{children}</main>
        </div>
    );
};

export default NavLayout