import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-store-data";
import { useMyInquiries, useCreateInquiry } from "@/hooks/use-b2b";
import { Upload, MessageSquare } from "lucide-react";

export default function B2BPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: inquiries } = useMyInquiries();
  const create = useCreateInquiry();

  const [form, setForm] = useState({ product_name: "", category_id: "", details: "", quantity: "", target_price: "" });
  const [files, setFiles] = useState<File[]>([]);

  const inputClass = "w-full border border-border bg-background px-3 py-2 text-sm";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_name.trim()) return toast.error("Tell us what product you need");
    create.mutate(
      {
        product_name: form.product_name,
        category_id: form.category_id || null,
        details: form.details,
        quantity: form.quantity ? Number(form.quantity) : null,
        target_price: form.target_price ? Number(form.target_price) : null,
        files,
      },
      {
        onSuccess: (data: any) => {
          toast.success("Inquiry submitted");
          navigate(`/b2b/${data.id}`);
        },
        onError: (err: any) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">B2B Sourcing</h1>
        <p className="text-muted-foreground max-w-2xl mb-8">
          Tell us exactly what you need — pick a category, add photos and volumes. Our sourcing team replies in a private chat with pricing and lead times.
        </p>

        {loading ? null : !user ? (
          <div className="border border-border p-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">You need an account to submit B2B inquiries and chat with our team.</p>
            <Link to="/signin" className="inline-block bg-foreground text-background px-5 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors">
              Sign in to continue
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10">
            <form onSubmit={submit} className="border border-border p-6 space-y-4">
              <h2 className="font-heading font-bold text-lg">New inquiry</h2>
              <div>
                <label className="text-xs uppercase tracking-wide font-semibold">Product needed</label>
                <input required maxLength={120} className={inputClass} value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide font-semibold">Category</label>
                <select className={inputClass} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Select a category</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wide font-semibold">Quantity</label>
                  <input type="number" min="1" className={inputClass} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide font-semibold">Target price / unit</label>
                  <input type="number" step="0.01" min="0" className={inputClass} value={form.target_price} onChange={(e) => setForm({ ...form, target_price: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide font-semibold">Details / specifications</label>
                <textarea rows={4} maxLength={2000} className={inputClass} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide font-semibold flex items-center gap-2"><Upload size={14} /> Reference photos (max 6)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="w-full text-sm mt-1"
                  onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 6))}
                />
                {files.length > 0 && <p className="text-xs text-muted-foreground mt-1">{files.length} file(s) selected</p>}
              </div>
              <button type="submit" disabled={create.isPending} className="bg-foreground text-background px-5 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors disabled:opacity-50">
                {create.isPending ? "Submitting..." : "Submit inquiry"}
              </button>
            </form>

            <div>
              <h2 className="font-heading font-bold text-lg mb-4">Your inquiries</h2>
              {inquiries && inquiries.length > 0 ? (
                <div className="border border-border divide-y divide-border">
                  {inquiries.map((i) => (
                    <Link key={i.id} to={`/b2b/${i.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-secondary/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{i.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {i.categories?.name || "Uncategorised"} · {i.status} · {new Date(i.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <MessageSquare size={16} className="text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No inquiries yet.</p>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
