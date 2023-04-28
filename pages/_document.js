import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
            let vh = window.innerHeight * 0.01;
            // Then we set the value in the --vh custom property to the root of the document
            document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
          `}}
        />
        {/* <Script id="asd" strategy="afterInteractive"
        dangerouslySetInnerHTML=
        /> */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
