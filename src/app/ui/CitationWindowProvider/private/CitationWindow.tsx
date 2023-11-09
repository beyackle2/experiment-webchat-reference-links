import { css } from '@emotion/css';
import { FocusTrapZone } from '@fluentui/react/lib/FocusTrapZone';
import { hooks } from 'botframework-webchat';
import { useMemo } from 'react';

import Dismiss16Regular from './Dismiss16Regular';

import { sanitize } from '../../MarkdownTextActivity/private/renderMarkdownAsHTML';

import './CitationWindow.css';

type Props = {
  text: string;
  title?: string;
  onClose: () => void;
};

const { useLocalizer, useRenderMarkdownAsHTML, useStyleOptions } = hooks;
const domParser = new DOMParser();

// return true if parsing this string returns anything with a non-text HTML node in it
function isHTML(text: string): boolean {
  // DOMParser is safe; even if it finds potentially dangerous objects, it doesn't run them, just parses them.
  // They'll get sanitized out in a future step before rendering.
  const parsed = domParser.parseFromString(text, 'text/html').body.childNodes;
  // need to use the old-school syntax here for ES version reasons
  for (let i = 0; i < parsed.length; i++) {
    const node = parsed[i];
    if (node.nodeType !== Node.TEXT_NODE) {
      return true;
    }
  }
  return false;
}

const CitationWindow = ({ text, title, onClose: handleClose }: Props) => {
  const [styleOptions] = useStyleOptions();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();

  const citationWindowOverrides = useMemo(
    () =>
      css({
        '--pva__accent-color': styleOptions.accent,
        '--pva__external-link-icon': styleOptions.markdownExternalLinkIconImage
      }),
    [styleOptions.accent]
  );

  //text = text.trim();
  const localize = useLocalizer();

  const externalLinkAlt = localize('MARKDOWN_EXTERNAL_LINK_ALT');

  return (
    <div className="mainWindow webchat__popover">
      <FocusTrapZone className="webchat__popover__box" firstFocusableTarget={'.closeBox'}>
        <span className="webchat__popover__header">
          <button aria-label={'close citation window'} className="webchat__popover__close-button" onClick={handleClose}>
            <Dismiss16Regular />
          </button>
          {title && <h2 className="webchat__popover__title">{title}</h2>}
        </span>

        <span
          className={['contents', citationWindowOverrides].join(' ')}
          dangerouslySetInnerHTML={{
            __html: isHTML(text) ? sanitize(text) : renderMarkdownAsHTML(text ?? '', styleOptions, { externalLinkAlt })
          }}
        />
      </FocusTrapZone>
    </div>
  );
};

export default CitationWindow;
