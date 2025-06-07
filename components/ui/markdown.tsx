'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { ClipboardIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';

// Estilos de highlight.js
import 'highlight.js/styles/github-dark.css';

interface MarkdownProps {
  content: string;
  className?: string;
}

const CodeBlock = ({ children, className }: any) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || 'text';
  
  const handleCopy = async () => {
    const text = typeof children === 'string' ? children : children.toString();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-gray-200 dark:bg-gray-800 px-4 py-2 text-sm rounded-t-lg border-b border-gray-300 dark:border-gray-700">
        <span className="text-gray-700 dark:text-gray-300 font-medium">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 text-green-400" />
          ) : (
            <ClipboardIcon className="w-4 h-4" />
          )}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="bg-gray-100 dark:bg-gray-900 overflow-x-auto rounded-b-lg p-4 text-sm">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
};

const InlineCode = ({ children }: any) => (
  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-pink-600 dark:text-pink-400">
    {children}
  </code>
);

// Configuración de sanitización para permitir HTML seguro
const sanitizeOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'strong', 'em', 'u', 'del', 's', 'ins',
    'a', 'img', 'video', 'audio',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
    'hr'
  ],
  allowedAttributes: {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'style'],
    'video': ['src', 'controls', 'width', 'height', 'poster'],
    'audio': ['src', 'controls'],
    'div': ['class', 'style'],
    'span': ['class', 'style'],
    'th': ['colspan', 'rowspan'],
    'td': ['colspan', 'rowspan']
  },
  allowedStyles: {
    '*': {
      'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      'font-weight': [/^bold$/, /^normal$/, /^[1-9]00$/],
      'font-style': [/^italic$/, /^normal$/],
      'text-decoration': [/^underline$/, /^line-through$/, /^none$/],
      'font-size': [/^\d+px$/, /^\d+em$/, /^\d+rem$/],
      'margin': [/^\d+px$/, /^\d+em$/, /^\d+rem$/],
      'padding': [/^\d+px$/, /^\d+em$/, /^\d+rem$/]
    }
  }
};

export default function Markdown({ content, className = '' }: MarkdownProps) {
  // Procesar el contenido para convertir bloques HTML en HTML renderizable
  const processedContent = content.replace(
    /```html\n([\s\S]*?)\n```/g,
    (match, htmlContent) => {
      // Convertir el bloque de código HTML en HTML directo
      return '\n' + htmlContent.trim() + '\n';
    }
  );

  return (
    <div className={`prose prose-gray dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw, // Permite HTML crudo
          [rehypeSanitize, sanitizeOptions], // Sanitiza el HTML
          rehypeHighlight // Resaltado de código
        ]}
        components={{
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className;
            return isInline ? (
              <InlineCode {...props}>{children}</InlineCode>
            ) : (
              <CodeBlock className={className} {...props}>
                {children}
              </CodeBlock>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-gray-300 dark:border-gray-600">
              <table className="min-w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-100 dark:bg-gray-800 font-semibold text-left text-gray-900 dark:text-gray-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4 pb-2 border-b border-gray-300 dark:border-gray-600">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-5 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 dark:text-gray-300">
              {children}
            </li>
          ),
          a: ({ children, href }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800 dark:text-gray-200">
              {children}
            </em>
          ),
          hr: () => (
            <hr className="my-6 border-gray-300 dark:border-gray-600" />
          ),
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-md my-4"
              loading="lazy"
            />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
} 