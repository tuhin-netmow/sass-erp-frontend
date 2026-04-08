import { useParams, Link } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGetJournalByIdQuery } from "@/store/features/app/accounting/accoutntingApiService";
import PrintableJournalEntry from "./PrintableJournalEntry";

export default function JournalPrintPreview() {
    const { journalId } = useParams();

    const { data: journalData, isLoading } = useGetJournalByIdQuery(journalId as string, {
        skip: !journalId,
    });


    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Loading journal preview...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen py-10 print:bg-white print:py-0">
            <div className="max-w-[850px] mx-auto mb-6 px-4 sm:px-0 print:hidden">
                <Link to={`/dashboard/accounting/reports/journal/${journalId}`}>
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Details
                    </Button>
                </Link>
            </div>
            {journalData?.data && (
                <PrintableJournalEntry
                    entry={journalData.data}
                />
            )}
        </div>
    );
}
