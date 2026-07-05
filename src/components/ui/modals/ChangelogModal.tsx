import ModalBase from "./ModalBase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  changelog: string;
  version: string;
}

export default function ChangelogModal({
  isOpen,
  onClose,
  changelog,
  version,
}: ChangelogModalProps) {
  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Changelog - v${version}`}
    >
      <div className="changelog-markdown text-xs sm:text-sm text-foreground leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ children, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
            h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
            h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
            p: ({ children, ...props }) => <p {...props}>{children}</p>,
            ul: ({ children, ...props }) => <ul {...props}>{children}</ul>,
            ol: ({ children, ...props }) => <ol {...props}>{children}</ol>,
            li: ({ children, ...props }) => <li {...props}>{children}</li>,
            blockquote: ({ children, ...props }) => (
              <blockquote {...props}>{children}</blockquote>
            ),
            code: ({ children, ...props }) => (
              <code {...props}>{children}</code>
            ),
            pre: ({ children, ...props }) => <pre {...props}>{children}</pre>,
            table: ({ children, ...props }) => (
              <table {...props}>{children}</table>
            ),
            thead: ({ children, ...props }) => (
              <thead {...props}>{children}</thead>
            ),
            tbody: ({ children, ...props }) => (
              <tbody {...props}>{children}</tbody>
            ),
            tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
            th: ({ children, ...props }) => <th {...props}>{children}</th>,
            td: ({ children, ...props }) => <td {...props}>{children}</td>,
            hr: (props) => <hr {...props} />,
          }}
        >
          {changelog}
        </ReactMarkdown>
      </div>
      <style>{`
        .changelog-markdown h1,
        .changelog-markdown h2,
        .changelog-markdown h3 {
          color: var(--color-highlight);
          font-family: monospace;
          font-weight: 700;
          letter-spacing: 0.02em;
          margin-top: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .changelog-markdown h1 { font-size: 1rem; }
        .changelog-markdown h2 { font-size: 0.95rem; }
        .changelog-markdown h3 { font-size: 0.9rem; }
        .changelog-markdown p { margin: 0.45rem 0; }

        /* lists: show a dash marker for each li */
        .changelog-markdown ul,
        .changelog-markdown ol {
          margin: 0.45rem 0 0.65rem 0;
          padding-left: 1rem;
          list-style: none;
        }
        .changelog-markdown li {
          position: relative;
          margin: 0.2rem 0;
          padding-left: 0.9rem;
        }
        .changelog-markdown li::before {
          content: "-";
          position: absolute;
          left: 0;
          top: 0;
          color: var(--color-highlight);
          font-weight: 700;
          line-height: 1;
        }
        .changelog-markdown a {
          color: var(--color-highlight);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .changelog-markdown code {
          background: color-mix(in oklab, var(--color-secondary) 75%, transparent);
          border: 1px solid color-mix(in oklab, var(--color-secondary) 85%, var(--color-highlight) 15%);
          border-radius: 0.35rem;
          padding: 0.1rem 0.3rem;
          font-size: 0.85em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .changelog-markdown pre {
          background: color-mix(in oklab, var(--color-secondary) 65%, transparent);
          border: 1px solid color-mix(in oklab, var(--color-secondary) 85%, var(--color-highlight) 15%);
          border-radius: 0.55rem;
          padding: 0.75rem;
          overflow-x: auto;
          margin: 0.7rem 0;
        }
        .changelog-markdown pre code {
          background: transparent;
          border: 0;
          padding: 0;
          font-size: 0.85em;
        }
        .changelog-markdown blockquote {
          border-left: 2px solid color-mix(in oklab, var(--color-highlight) 70%, transparent);
          padding-left: 0.7rem;
          color: color-mix(in oklab, var(--color-foreground) 70%, transparent);
          margin: 0.6rem 0;
        }
        .changelog-markdown hr {
          border: 0;
          border-top: 1px solid color-mix(in oklab, var(--color-secondary) 70%, transparent);
          margin: 0.8rem 0;
        }
        .changelog-markdown table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.6rem 0;
          font-size: 0.9em;
        }
        .changelog-markdown th,
        .changelog-markdown td {
          border: 1px solid color-mix(in oklab, var(--color-secondary) 75%, transparent);
          padding: 0.35rem 0.45rem;
          text-align: left;
        }
        .changelog-markdown th {
          color: var(--color-highlight);
          background: color-mix(in oklab, var(--color-secondary) 80%, transparent);
        }
      `}</style>
    </ModalBase>
  );
}
