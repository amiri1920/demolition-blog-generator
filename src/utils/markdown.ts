import { BlogPost } from '@/types/blog.types';

export function blogPostToMarkdown(post: BlogPost): string {
  const sections = [
    `# ${post.title}`,
    '',
    `> ${post.metaDescription}`,
    '',
    `**Keywords:** ${post.keywords.join(', ')}`,
    `**Reading Time:** ${post.readingTime} minutes`,
    `**Word Count:** ${post.wordCount} words`,
    '',
    '---',
    '',
    '## Introduction',
    '',
    post.introduction,
    '',
    '## Main Content',
    '',
    post.mainContent,
    '',
    '## Conclusion',
    '',
    post.conclusion,
  ];

  if (post.imageUrls && post.imageUrls.length > 0) {
    sections.push('', '## Images', '');
    post.imageUrls.forEach((url, index) => {
      sections.push(`![Image ${index + 1}](${url})`);
    });
  }

  sections.push(
    '',
    '---',
    '',
    `*Generated on ${new Date(post.timestamp).toLocaleDateString()}*`
  );

  return sections.join('\n');
}

export function blogPostToHTML(post: BlogPost): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${post.metaDescription}">
    <meta name="keywords" content="${post.keywords.join(', ')}">
    <title>${post.title}</title>
    <style>
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        h1 { color: #1a1a1a; border-bottom: 3px solid #ff6b35; padding-bottom: 0.5rem; }
        h2 { color: #2a2a2a; margin-top: 2rem; }
        .meta { 
            background: #f5f5f5; 
            padding: 1rem; 
            border-radius: 8px; 
            margin: 1rem 0;
        }
        .keywords { color: #666; font-style: italic; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
        blockquote { 
            border-left: 4px solid #ff6b35; 
            padding-left: 1rem; 
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <article>
        <h1>${post.title}</h1>
        
        <div class="meta">
            <blockquote>${post.metaDescription}</blockquote>
            <p class="keywords"><strong>Keywords:</strong> ${post.keywords.join(', ')}</p>
            <p><strong>Reading Time:</strong> ${post.readingTime} minutes | <strong>Word Count:</strong> ${post.wordCount} words</p>
        </div>

        <section>
            <h2>Introduction</h2>
            <p>${post.introduction.replace(/\n/g, '</p><p>')}</p>
        </section>

        <section>
            <h2>Main Content</h2>
            <p>${post.mainContent.replace(/\n/g, '</p><p>')}</p>
        </section>

        <section>
            <h2>Conclusion</h2>
            <p>${post.conclusion.replace(/\n/g, '</p><p>')}</p>
        </section>

        ${post.imageUrls && post.imageUrls.length > 0 ? `
        <section>
            <h2>Images</h2>
            ${post.imageUrls.map((url, index) => 
                `<img src="${url}" alt="Demolition Image ${index + 1}" />`
            ).join('\n')}
        </section>
        ` : ''}

        <footer>
            <hr />
            <p><em>Generated on ${new Date(post.timestamp).toLocaleDateString()}</em></p>
        </footer>
    </article>
</body>
</html>`;
}