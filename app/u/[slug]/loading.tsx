import { LoadingShell } from "@/components/loading-shell";

export default function Loading() {
  return (
    <div className="relative flex min-h-screen items-start justify-center p-6 md:p-7">
      <div className="shell w-full max-w-[1100px] min-h-[calc(100vh-3rem)]">
        <div className="shell-inner">
          <LoadingShell rows={2} />
        </div>
      </div>
    </div>
  );
}
