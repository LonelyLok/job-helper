"use client"
import React, { useState } from 'react';
import { ListItemButton, ListItemText, ListItem, List, Drawer, Box } from '@mui/material'
import { Settings, House, Logout } from '@mui/icons-material'
import { useRouter } from 'next/navigation';

const HoverDrawer = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const res = await fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'include',
    })
    router.push('/login')
  }

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  const handleGoToHome = () => {
    router.push('/')
  }

  const handleGoToSettings = () => {
    router.push('/settings')
  }

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100px',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.1)',
      zIndex: 1000
    }}>
      <Drawer open={open} onClose={() => setOpen(false)} anchor='left' PaperProps={{ onMouseLeave: handleMouseLeave }}>
        <Box display="flex" flexDirection="column" height="100%">
          <List>
            <List>
            <ListItem>
                <ListItemButton onClick={() => handleGoToHome()}>
                  <House/>
                  <ListItemText primary="Home" />
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton onClick={() => handleGoToSettings()}>
                  <Settings/>
                  <ListItemText primary="Settings" />
                </ListItemButton>
              </ListItem>
            </List>
          </List>
          <Box flexGrow={1} />
          <List>
            <ListItem>
              <ListItemButton onClick={() => handleLogout()}>
                <Logout/>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </div>
  );
};

export default HoverDrawer;
