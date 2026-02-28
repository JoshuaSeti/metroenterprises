export default function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">This section is coming soon.</p>
    </div>
  );
}
