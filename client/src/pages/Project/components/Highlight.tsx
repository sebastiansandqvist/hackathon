import highlightJs from 'highlight.js';
import { createMemo, splitProps, type Component, type JSX } from 'solid-js';

type Props = JSX.HTMLAttributes<HTMLElement> & {
  autoDetect?: boolean;
  language?: string;
  children: string;
};

export const Highlight: Component<Props> = (props) => {
  const [config, htmlProps] = splitProps(props, ['autoDetect', 'language', 'children']);

  const highlightedCode = createMemo(() => {
    const result =
      config.language && highlightJs.listLanguages().includes(config.language.toLowerCase())
        ? highlightJs.highlight(config.children, { language: config.language.toLowerCase(), ignoreIllegals: true })
        : highlightJs.highlightAuto(config.children);
    return result.value;
  });

  return (
    <pre>
      <code {...htmlProps} class={`hljs ${htmlProps.class ?? ''}`} innerHTML={highlightedCode()} />
    </pre>
  );
};
