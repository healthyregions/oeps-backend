import Head from "next/head";
import { useRouter } from 'next/router'
import styles from "./MarkdownDocs.module.css";
import { useState, useEffect } from "react";
import { Gutter } from "../../components/layout/Gutter";
import MainNav from "../../components/layout/MainNav";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import Footer from "../../components/layout/Footer";

const BASE_DOCS_URL = 'https://raw.githubusercontent.com/GeoDaCenter/opioid-policy-scan/main/data_final/metadata/'
const fetchMarkdown = async (url) => await fetch(url).then(r => r.text()).then(r => r.replace('[here](/data_final).', '[here](/download).'))

export default function MarkdownDocs() {
  const router = useRouter()
  const { md } = router.query
  const [markdownText, setMarkdownText] = useState('## Loading...')

  useEffect(() => {
    if (md !== undefined){
      try {
        fetchMarkdown(`${BASE_DOCS_URL}${md}.md`).then(result => setMarkdownText(result))
      } catch(e) {
        setMarkdownText('## Error - Could not locate information.')
      }
    }
  },[md])
          
  return (
    <div className={styles.container}>
      <Head>
        <title>OEPS Docs :: {md}</title>
        <meta name="description" content="Generated by create next app" />
        <script defer data-domain="oeps.healthyregions.org" src="https://plausible.io/js/script.js"></script>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,900;1,400;1,700&family=Lora:ital@0;1&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,900;1,400;1,700&family=Lora:ital@0;1&display=swap"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,900;1,400;1,700&family=Lora:ital@0;1&display=swap"
          />
        </noscript>
      </Head>
      <MainNav />
      <main className={styles.main}>
        <h1 className={styles.title}>
          {md}
        </h1>
        <div className={styles.markdownContainer}>
          <a href='/docs'>Return to docs</a>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownText}</ReactMarkdown> 
        </div>
        <Gutter em={5} />
      </main>
      <Footer />
    </div>
  );
}
