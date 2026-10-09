import cmrRaw from '../../public/images/cmr-red.svg?raw';
import webDevRaw from '../../public/images/web-dev.svg?raw';

/** Strip XML/comments and size the mark with viewBox so CSS height controls it. */
function prepareInlineSvg(raw: string): string {
  let svg = raw.replace(/<\?xml[\s\S]*?\?>/gi, '').replace(/<!--[\s\S]*?-->/g, '').trim();
  const width = svg.match(/\bwidth="([^"]+)"/)?.[1] ?? '0';
  const height = svg.match(/\bheight="([^"]+)"/)?.[1] ?? '0';
  svg = svg.replace(/\s+width="[^"]*"/, '').replace(/\s+height="[^"]*"/, '');
  svg = svg.replace(
    '<svg',
    `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false" style="display:block;height:100%;width:auto;overflow:visible"`
  );
  return svg;
}

const cmrMark = prepareInlineSvg(cmrRaw);
const webDevMark = prepareInlineSvg(webDevRaw);

type CmrWebDevLockupProps = {
  /** CMR uses the host primary fill when true. Default leaves baked-in red. */
  branded?: boolean;
  /** web-dev paths turn white on a dark footer. Infer from the existing footer surface. */
  onDark?: boolean;
  /** Tailwind arbitrary fill for CMR paths when branded, e.g. "[&_path]:fill-blue-800". */
  brandFillClassName?: string;
};

export default function CmrWebDevLockup({
  branded = false,
  onDark = false,
  brandFillClassName = '[&_path]:fill-blue-800',
}: CmrWebDevLockupProps) {
  const cmrColor = branded ? brandFillClassName : '';
  const webDevColor = onDark ? '[&_path]:fill-white' : '';

  return (
    <a href="https://cmrweb.dev" target="_blank" rel="noopener noreferrer" className="hover:underline">
      Crafted by{' '}
      <span className="inline-flex items-end gap-px">
        <span
          className={`inline-flex overflow-visible h-[18px] ${cmrColor}`}
          dangerouslySetInnerHTML={{ __html: cmrMark }}
        />
        <span
          className={`inline-flex overflow-visible h-[8px] ${webDevColor}`}
          dangerouslySetInnerHTML={{ __html: webDevMark }}
        />
      </span>
      <span className="sr-only">CMR Web Dev</span>
    </a>
  );
}
