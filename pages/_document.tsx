
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html dir="rtl" lang="fa">
      <Head>
        <meta name="application-name" content="حساب یار" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="حساب یار" />
        <meta name="description" content="نرم‌افزار مدیریت فروش و حسابداری" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0f15c2" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon512_rounded.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}