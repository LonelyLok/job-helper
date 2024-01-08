"use client"
import React, { useState } from 'react';
import { withAuth } from "./auth-hoc";
import NavLayout from './components/NavLayout'
import { List, ListItem, ListItemText, ListItemButton, Typography  } from '@mui/material'

const rootPageStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
}

const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '50%', // adjust this value as needed
    margin: '0 auto'
}

function RootPage() {
    return (
        <NavLayout>
            <div>
                <Typography variant="h1" style={rootPageStyle}>Hello</Typography >
                <div style={listStyle}>
                    <List>
                        <ListItem style={{backgroundColor: 'lightblue'}}>
                            <ListItemButton component="a" href="/job-card">
                                <ListItemText primary="Jobs for discord" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </div>
            </div>
        </NavLayout>
    );
}

export default withAuth(RootPage);