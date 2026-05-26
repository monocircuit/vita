type NextFontResult = {
  className: string;
  variable: string;
  style: { fontFamily: string; fontStyle?: string; fontWeight?: string | number };
};

export default function localFont(_options: { src: unknown; [key: string]: unknown }): NextFontResult {
  return {
    className: '',
    variable: '',
    style: { fontFamily: 'Geist Sans, system-ui, sans-serif' },
  };
}
