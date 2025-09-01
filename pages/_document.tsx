import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="fa" dir="rtl">
        <Head>
          <link rel="icon" href="./icons/icon.svg" />
          <style
            dangerouslySetInnerHTML={{
              __html: `
              @font-face {
                font-family: 'Vazirmatn';
                src: url('/fonts/Vazir.woff2') format('woff2');
                font-weight: 100 900;
                font-style: normal;
                font-display: swap;
              }
            `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;