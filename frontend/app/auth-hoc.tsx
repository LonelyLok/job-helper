"use client"
import React, { useEffect, useState, ComponentType } from 'react';
import { useRouter, usePathname  } from 'next/navigation';

const withAuth = (WrappedComponent: ComponentType) => {
    const WithAuthComponent = (props: any) => {
        const router = useRouter();
        const pathname = usePathname()
        const [isAuthenticated, setIsAuthenticated] = useState(false);

        useEffect(() => {
            const validateToken = async () => {
                try {
                    const response = await fetch('http://localhost:5000/is_token_valid', {
                        method: 'GET',
                        credentials: 'include', // If you're using cookies
                    });

                    if (response.ok) {
                        setIsAuthenticated(true);
                    } else {
                        sessionStorage.setItem('preAuthPath', pathname);
                        router.push('/login');
                    }
                } catch (error) {
                    console.error('Error validating token:', error);
                    sessionStorage.setItem('preAuthPath', pathname);
                    router.push('/login');
                }
            };

            validateToken();
        }, [router, pathname]);

        if (!isAuthenticated) {
            return <div>Loading...</div>;
        }

        return <WrappedComponent {...props} />;
    };

    // Assign a display name to the component
    WithAuthComponent.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

    return WithAuthComponent;
};

// Helper function to get the display name of a component
function getDisplayName(WrappedComponent:any) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export { withAuth };