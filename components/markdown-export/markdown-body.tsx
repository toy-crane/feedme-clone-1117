import ReactMarkdown from "react-markdown";

export function MarkdownBody({ markdown }: { markdown: string }) {
  return (
    <div className="text-[15px] leading-7 break-keep [overflow-wrap:anywhere] [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:mb-3.5 [&_blockquote]:border-l-[3px] [&_blockquote]:pl-3.5 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-7 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:mb-3.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3.5 [&_pre]:mb-3.5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_ul]:mb-3.5 [&_ul]:list-disc [&_ul]:pl-5 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
