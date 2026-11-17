import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ArticleHeaderProps = {
  title: string;
  author: string;
  site: string;
  url: string;
};

export function ArticleHeader({ title, author, site, url }: ArticleHeaderProps) {
  return (
    <CardHeader className="gap-2 border-b py-5 [&>*]:min-w-0">
      <h1 className="font-heading text-xl leading-snug font-semibold text-balance break-keep [overflow-wrap:anywhere]">
        {title}
      </h1>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        {author && (
          <span data-slot="author" className="font-medium text-foreground">
            {author}
          </span>
        )}
        <Badge variant="secondary">{site}</Badge>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all underline underline-offset-4"
        >
          {url.replace(/^https?:\/\//, "")}
        </a>
      </div>
    </CardHeader>
  );
}
