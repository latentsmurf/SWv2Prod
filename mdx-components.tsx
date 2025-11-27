import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        h1: ({ children }) => (
            <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">{children}</h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-white mt-10 mb-4 tracking-tight border-b border-white/10 pb-2">{children}</h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-xl font-medium text-white mt-8 mb-3">{children}</h3>
        ),
        p: ({ children }) => (
            <p className="text-gray-300 leading-relaxed mb-6 text-lg">{children}</p>
        ),
        ul: ({ children }) => (
            <ul className="list-disc list-outside ml-6 mb-6 text-gray-300 space-y-2">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-6 mb-6 text-gray-300 space-y-2">{children}</ol>
        ),
        li: ({ children }) => (
            <li className="pl-1">{children}</li>
        ),
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-yellow-500 pl-4 italic text-gray-400 my-6 bg-white/5 p-4 rounded-r-lg">
                {children}
            </blockquote>
        ),
        code: ({ children }) => (
            <code className="bg-white/10 text-yellow-400 rounded px-1.5 py-0.5 text-sm font-mono">{children}</code>
        ),
        pre: ({ children }) => (
            <pre className="bg-[#1a1a1a] p-4 rounded-lg overflow-x-auto mb-6 border border-white/10">
                {children}
            </pre>
        ),
        a: ({ href, children }) => (
            <a href={href} className="text-yellow-500 hover:text-yellow-400 underline decoration-yellow-500/30 hover:decoration-yellow-500 transition-all">
                {children}
            </a>
        ),
        ...components,
    };
}
