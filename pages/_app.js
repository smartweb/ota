import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#d9432b" />
        <title>乐享出行 · 老年人订机票酒店</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
