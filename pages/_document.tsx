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

 <meta name="application-name" content="Hessabyar POS" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Hessabyar" />
        <meta name="description" content="Point of Sale Application" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FFFFFF" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon.svg"></link>


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