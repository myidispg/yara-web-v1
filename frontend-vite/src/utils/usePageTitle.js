import { useEffect } from "react";

export default function usePageTitle(title) {
    useEffect(() => {
        document.title = title
            ? `${title} | YA-RA®`
            : "YA-RA® | Natural Diamond Fine Jewellery";
    }, [title]);
}