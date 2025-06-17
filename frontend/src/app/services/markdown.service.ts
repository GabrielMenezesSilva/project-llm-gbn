import { Injectable } from '@angular/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  constructor() {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  convertToHtml(markdown: string): string {
    if (!markdown) return '';
    const html = marked.parse(markdown) as string;
    return DOMPurify.sanitize(html, { RETURN_TRUSTED_TYPE: false }) as string;
  }
}
