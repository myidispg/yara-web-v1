import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const CategoryContext = createContext({ categories: [] });

export function CategoryProvider({ children }) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        api.get("/categories/")
            .then((r) => setCategories(r.data.results ?? r.data))
            .catch(() => { }); // UI falls back to a static list
    }, []);

    return <CategoryContext.Provider value={{ categories }}>{children}</CategoryContext.Provider>;
}

export const useCategories = () => useContext(CategoryContext);