import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext(null);
console.log('UserProvider: rendering');

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser должен использоваться внутри UserProvider');
    }
    return context;
};