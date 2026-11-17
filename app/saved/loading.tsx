import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Skeleton className="h-6 w-24" />
      <ul aria-busy="true" aria-label="저장 목록 불러오는 중" className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <Card className="gap-2 py-4">
              <div className="flex flex-col gap-2 px-6">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
