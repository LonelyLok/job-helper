"use client"
import React, { useState, useContext } from 'react';
import { Box, TextField, Button, Typography, Container, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // Use your auth context or state management solution here
    // const { onLogin } = useContext(AuthContext);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch(`http://localhost:5000/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    data: {
                        username,
                        password
                    }
                })
            });

            if (response.ok) {
                const res = await response.json()
                const preAuthPath = sessionStorage.getItem('preAuthPath');
                if (preAuthPath) {
                    router.push(preAuthPath);
                    sessionStorage.removeItem('preAuthPath');
                } else {
                    // Redirect to default path
                    router.push('/');
                }
                // Handle successful login
                // You might want to redirect the user or update the state
            } else {
                // Handle errors, e.g., display error messages from the response
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
            }
        } catch (err: any) {
            // Handle errors, e.g., display error messages
            setError(err.message || 'An error occurred');
        }
    };

    const outlineStyle = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'white', // Change this to your desired border color (normal state)
            },
            '&:hover fieldset': {
                borderColor: 'white', // Change this for the hover state
            },
            '&.Mui-focused fieldset': {
                borderColor: 'white', // Change this for the focused state
            },
        },
    }

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        InputLabelProps={{
                            style: { color: 'white' }, // Sets the color of the label to white
                        }}
                        InputProps={{
                            style: { color: 'white' }, // Sets the color of the input text to white
                        }}
                        sx={outlineStyle}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputLabelProps={{
                            style: { color: 'white' }, // Sets the color of the label to white
                        }}
                        InputProps={{
                            style: { color: 'white' }, // Sets the color of the input text to white
                        }}
                        sx={outlineStyle}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default LoginPage;