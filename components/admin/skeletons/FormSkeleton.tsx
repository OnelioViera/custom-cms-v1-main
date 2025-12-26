export default function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
        </div>
      ))}
      <div className="flex gap-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
      </div>
    </div>
  );
}
