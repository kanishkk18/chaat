import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="h-full" >
      <Head />
import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
    }
  )
  return (
    <Html lang="en" className="h-full" suppressHydrationWarning>
      <Head>
        <title>Discord Clone</title>
        <meta name="description" content="Discord Clone with Next.js, React.js, TailWindCSS & TypeScript." />
      </Head>
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
