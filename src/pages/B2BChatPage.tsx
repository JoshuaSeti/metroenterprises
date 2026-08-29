import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InquiryChat from "@/components/InquiryChat";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useInquiry } from "@/hooks/use-b2b";
import { ArrowLeft } from "lucide-react";

export default function B2BChatPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const { data: inquiry, isLoading } = useInquiry(id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 max-w-3xl">
        <Link to="/b2b" className="inline-flex items-center gap-2 text-xs uppercase tracking-wide font-semibold text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={14} /> Back to inquiries
        </Link>

        {loading || isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !user ? (
          <div className="border border-border p-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">Sign in to view this conversation.</p>
            <Link to="/signin" className="inline-block bg-foreground text-background px-5 py-2 text-xs font-semibold uppercase tracking-wide">Sign in</Link>
          </div>
        ) : !inquiry ? (
          <p className="text-sm text-muted-foreground">Inquiry not found.</p>
        ) : (
          <InquiryChat inquiry={inquiry} isAdmin={false} />
        )}
      </main>
      <Footer />
    </div>
  );
}
