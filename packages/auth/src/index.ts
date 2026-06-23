import React from "react";

interface User {
    id: string;
    name: string;
    scopes: string[];
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);

    const login = async (username: string, password: string) => {
        void username;
        void password;
        await new Promise((resolve) => setTimeout(resolve, 500));
        throw new Error("Mock authentication is disabled. Configure the real auth provider.");
    };

    const logout = () => {
        setUser(null);
    };

    const isAuthenticated = !!user;

    const value = { user, isAuthenticated, login, logout };

    return <AuthContext.Provider value={ value }> { children } </AuthContext.Provider>;
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
