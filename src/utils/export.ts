import { saveAs } from 'file-saver';
import { BlogPost } from '@/types/blog.types';
import { blogPostToMarkdown, blogPostToHTML } from './markdown';

export async function exportAsMarkdown(post: BlogPost) {
  const markdown = blogPostToMarkdown(post);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const filename = `${post.title.toLowerCase().replace(/\s+/g, '-')}.md`;
  saveAs(blob, filename);
}

export async function exportAsHTML(post: BlogPost) {
  const html = blogPostToHTML(post);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const filename = `${post.title.toLowerCase().replace(/\s+/g, '-')}.html`;
  saveAs(blob, filename);
}

export async function exportAsPDF(post: BlogPost) {
  if (typeof window === 'undefined') {
    throw new Error('PDF export is only available in the browser');
  }
  
  const html = blogPostToHTML(post);
  
  const element = document.createElement('div');
  element.innerHTML = html;
  element.style.padding = '20px';
  
  try {
    // Dynamically import html2pdf only on client side
    const html2pdf = (await import('html2pdf.js')).default;
    
    const options = {
      margin: 1,
      filename: `${post.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    
    await html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}