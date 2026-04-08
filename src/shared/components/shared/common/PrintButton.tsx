import { useReactToPrint } from "react-to-print";
import { Button } from "@/shared/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
    contentRef: React.RefObject<HTMLDivElement | null>;
    title?: string;
    hideText?: boolean;
}

export const PrintButton = ({ contentRef, title = "Print", hideText = false }: PrintButtonProps) => {
    const handlePrint = useReactToPrint({
        contentRef: contentRef,
        documentTitle: title,
    });

    return (
        <Button onClick={() => handlePrint && handlePrint()} className="gap-2" variant="outline" size={hideText ? "icon" : "default"}>
            <Printer className="w-4 h-4" />
            {!hideText && <span>{title}</span>}
        </Button>
    );
};
