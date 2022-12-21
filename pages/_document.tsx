import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='ko'>
      <Head />
      <link rel='icon' href='/favicon.ico' />
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='' />
      <link
        href='https://fonts.googleapis.com/css2?family=Dancing+Script&family=Nanum+Pen+Script&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap'
        rel='stylesheet'
      />

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
