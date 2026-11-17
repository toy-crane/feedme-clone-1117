import { ArticleHeader } from "@/components/markdown-export/article-header";
import { ExportPanel } from "@/components/markdown-export/export-panel";
import { MarkdownBody } from "@/components/markdown-export/markdown-body";
import { Card } from "@/components/ui/card";

import type { ArticleInput } from "./actions";

export function SavedArticleView({ article }: { article: ArticleInput }) {
  return (
    <Card role="article" className="gap-0 py-0">
      <ArticleHeader {...article} />
      <ExportPanel title={article.title} markdown={article.markdown} />
      <div className="px-6 py-5">
        <MarkdownBody markdown={article.markdown} />
      </div>
    </Card>
  );
}
