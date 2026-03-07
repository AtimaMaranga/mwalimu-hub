import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <p className="text-8xl font-bold font-heading text-indigo-100 mb-4">
            404
          </p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Samahani! The page you&apos;re looking for doesn&apos;t exist or
            has been moved. Let&apos;s get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="primary">Go to Homepage</Button>
            </Link>
            <Link href="/teachers">
              <Button variant="outline">Find a Teacher</Button>
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
