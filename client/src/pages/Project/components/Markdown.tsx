import { Show, splitProps, type Component, type JSX, type Accessor } from 'solid-js';
import { Highlight } from './Highlight';
import { SectionHeading, Uppercase } from '../../../components/Text';

function sanitizeUrl(input?: string) {
  if (!input) {
    return null;
  }

  const hasProtocol = /^https?:\/\//i.test(input);
  const url = hasProtocol ? input : `https://${input}`;

  try {
    const protocol = new URL(url, 'https://localhost').protocol;
    if (
      protocol.indexOf('javascript:') === 0 ||
      protocol.indexOf('vbscript:') === 0 ||
      protocol.indexOf('data:') === 0
    ) {
      return null;
    }
  } catch (e) {
    // invalid URLs should throw a TypeError
    // see for instance: `new URL('');`
    return null;
  }
  return url;
}

function parseInlineMarkdown(text: string) {
  const parts = [];
  let currentText = '';

  for (let i = 0; i < text.length; i++) {
    // the _ character needs special handling because a single word can have multiple underscores within it.
    const getClosingIndex = (char: string) => {
      // case 1: words like _this_
      // case 2: _words_like_this_
      // case 3: _words like this_
      // case 4: words like _this_!
      // case 5: _words like this_!
      // case 6: _multi_ words _too_.
      const close = text.lastIndexOf(char);
      if (close < i + 1) return { exists: false } as const;
      const words = text.slice(i, close).split(' ');

      let index = i - 1;
      for (const word of words) {
        index += word.length;
        if (word.endsWith(char)) {
          return { exists: true, index } as const;
        }
      }

      return { exists: true, index: close } as const;
    };

    // handle _ italics
    if (text[i] === '_' && (i === 0 || text[i - 1] === ' ')) {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }

      const close = getClosingIndex('_');
      if (close.exists) {
        parts.push(<em>{parseInlineMarkdown(text.slice(i + 1, close.index))}</em>);
        i = close.index;
      } else {
        parts.push('_'); // treat as a literal underscore if no matching closing `_` is detected
      }
      // handle ** bold
    } else if (text[i] === '*' && text[i + 1] === '*' && (i === 0 || text[i - 1] === ' ')) {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      const closingIndex = text.indexOf('**', i + 2);
      if (closingIndex !== -1) {
        parts.push(<strong>{parseInlineMarkdown(text.slice(i + 2, closingIndex))}</strong>);
        i = closingIndex + 1;
      } else {
        parts.push('**'); // treat as literal asterisks
      }
      // handle * italics
    } else if (text[i] === '*' && (i === 0 || text[i - 1] === ' ')) {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      const closingIndex = text.indexOf('*', i + 1);
      if (closingIndex !== -1) {
        parts.push(<em>{parseInlineMarkdown(text.slice(i + 1, closingIndex))}</em>);
        i = closingIndex + 1;
      } else {
        parts.push('*'); // treat as a literal asterisk
      }
      // handle ` inline code
    } else if (text[i] === '`' && (i === 0 || text[i - 1] === ' ')) {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      const closingIndex = text.indexOf('`', i + 1);
      if (closingIndex !== -1) {
        parts.push(<code>{text.slice(i + 1, closingIndex)}</code>);
        i = closingIndex;
      } else {
        parts.push('`'); // treat as a literal backtick
      }
      // handle [links](https://...)
      // handle ![images](...) by just showing the alt text
    } else if (text[i] === '[' || (text[i] === '!' && text[i + 1] === '[')) {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      const isImage = text[i] === '!';
      const openBracketIndex = text[i] === '[' ? i : i + 1;
      const closingBracketIndex = text.indexOf(']', i + 1);
      if (closingBracketIndex !== -1) {
        let linkText = text.slice(openBracketIndex + 1, closingBracketIndex);
        let openParenIndex = text.indexOf('(', closingBracketIndex + 1);
        if (openParenIndex !== -1) {
          let closingParenIndex = text.indexOf(')', openParenIndex + 1);
          if (closingParenIndex !== -1) {
            const href = sanitizeUrl(text.slice(openParenIndex + 1, closingParenIndex));
            parts.push(
              isImage ? (
                <figure class="mb-4">
                  <Show when={href} fallback={<figcaption>{linkText}</figcaption>}>
                    <img src={href ?? ''} alt={linkText} />
                  </Show>
                </figure>
              ) : href ? (
                <a
                  href={href}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(href);
                  }}
                >
                  {linkText}
                </a>
              ) : (
                <span>{linkText}</span>
              ),
            );
            i = closingParenIndex;
          } else {
            parts.push('('); // treat as a literal '('
          }
        } else {
          parts.push('['); // treat as a literal '['
        }
      } else {
        parts.push('['); // treat as a literal '['
      }
    } else {
      currentText += text[i];
    }
  }

  if (currentText) {
    parts.push(currentText);
  }

  return parts;
}

/*
  Lines will be markdown that could look like...
  [
    '- Example',
    '- Unordered *list*',
    '  - Nested _list items_',
    '  - Nested [thing](https://smudge.ai)',
    '    1. Inner nested',
    '    2. Inner nested',
    '- Fully unnested'
  ]
*/
function parseList(lines: string[]) {
  if (lines.length === 0) return null;
  const listItems = [];
  for (let i = 0; i < lines.length; i++) {
    const item = lines[i]!;
    const leadingWhitespace = item.match(/^(\s*)/)?.[0] ?? '';
    const nestedList = [];

    while (
      i + 1 < lines.length &&
      lines[i + 1]!.replace(leadingWhitespace, '').match(/^(\s*)/)?.[0].length &&
      (lines[i + 1]!.trim().startsWith('* ') ||
        lines[i + 1]!.trim().startsWith('- ') ||
        lines[i + 1]!.trim().match(/^\d+\. /))
    ) {
      i += 1;
      nestedList.push(lines[i]!.trim());
    }

    listItems.push(
      <li>
        {item.trim().startsWith('- ') || item.trim().startsWith('* ')
          ? parseInlineMarkdown(item.trim().slice(2))
          : parseInlineMarkdown(item.trim().replace(/^\d+\. /, ''))}
        {nestedList.length > 0 && parseList(nestedList)}
      </li>,
    );
  }

  const firstChar = lines[0]?.trim()[0];

  if (firstChar === '-' || firstChar === '*') {
    return (
      <ul class="mb-6 grid list-outside list-disc gap-2 pt-2 px-10 text-indigo-100 marker:text-indigo-300/75">
        {listItems}
      </ul>
    );
  }

  const listNumber = lines[0]?.trim().match(/^(\d+)\. /);
  const startNumber = listNumber ? parseInt(listNumber[1] ?? '1', 10) : 1;

  return (
    <ol
      class="mb-6 grid list-outside list-decimal gap-2 pt-2 px-10 text-indigo-100 marker:text-indigo-300/75"
      start={startNumber}
    >
      {listItems}
    </ol>
  );
}

// parse markdown and convert it to solidjs elements
function parseMarkdownToJSX(text: string) {
  const lines = text.split('\n');
  const elements: JSX.ArrayElement = [];

  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    if (inCodeBlock) {
      // inside a code block, add the line to the content,
      // but do not do any other parsing on it.
      if (line.startsWith('```')) {
        // end the current code block and render it
        inCodeBlock = false;
        if (codeBlockLanguage === 'markdown') {
          // parse ```markdown code blocks as regular text
          elements.push(...parseMarkdownToJSX(codeBlockContent.join('\n')));
        } else {
          elements.push(
            <Highlight language={codeBlockLanguage} class="not-prose mb-6 overflow-x-auto bg-indigo-950/75 p-6">
              {codeBlockContent.join('\n')}
            </Highlight>,
          );
        }
        // Clear code block content
        codeBlockContent = [];
      } else {
        codeBlockContent.push(line);
      }
    } else if (line.startsWith('```')) {
      inCodeBlock = true;
      codeBlockLanguage = line.slice(3).trim();
    } else if (line.startsWith('# ')) {
      const headerText = line.slice(2);
      elements.push(
        <SectionHeading class="mt-6 mb-2 text-lg first:mt-0">{parseInlineMarkdown(headerText)}</SectionHeading>,
      );
    } else if (line.startsWith('## ')) {
      const headerText = line.slice(3);
      elements.push(
        <Uppercase as="h2" class="mt-6 mb-2 !text-indigo-300 first:mt-0">
          {parseInlineMarkdown(headerText)}
        </Uppercase>,
      );
    } else if (line.startsWith('### ')) {
      const headerText = line.slice(4);
      elements.push(<h3 class="font-bold text-white">{parseInlineMarkdown(headerText)}</h3>);
    } else if (line.startsWith('#### ')) {
      const headerText = line.slice(5);
      elements.push(<h4 class="font-bold">{parseInlineMarkdown(headerText)}</h4>);
    } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().match(/^\d+\. /)) {
      const listLines = [line];
      while (
        i + 1 < lines.length &&
        (lines[i + 1]!.trim().startsWith('* ') ||
          lines[i + 1]!.trim().startsWith('- ') ||
          lines[i + 1]!.trim().match(/^\d+\. /))
      ) {
        i += 1;
        listLines.push(lines[i]!);
      }
      elements.push(parseList(listLines));
    } else if (line.trim() !== '') {
      elements.push(<p class="mb-6">{parseInlineMarkdown(line)}</p>);
    }
  }

  // in order to support streaming in code blocks, render any
  // unfinished code blocks at the end
  if (inCodeBlock) {
    if (codeBlockLanguage === 'markdown') {
      // parse  ```markdown code blocks as regular text
      elements.push(...parseMarkdownToJSX(codeBlockContent.join('\n')));
    } else {
      elements.push(
        <Highlight language={codeBlockLanguage} class="not-prose mb-6 overflow-x-auto bg-indigo-950/75 p-6">
          {codeBlockContent.join('\n')}
        </Highlight>,
      );
    }
  }

  return elements;
}

type Props = JSX.HTMLAttributes<HTMLDivElement> & {
  source: Accessor<string>;
};

export const Markdown: Component<Props> = (combinedProps) => {
  const [jsxProps, props] = splitProps(combinedProps, ['source']);
  return <div {...props}>{parseMarkdownToJSX(jsxProps.source())}</div>;
};
