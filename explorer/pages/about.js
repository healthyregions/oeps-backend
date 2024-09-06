import Head from "next/head";
import Image from 'next/image';
import Link from 'next/link';
import styles from "../styles/About.module.css";
import { Gutter } from "../components/layout/Gutter";
import MainNav from "../components/layout/MainNav";
import Footer from "../components/layout/Footer";

const contributors = [
  {
    name:'Marynia Kolak',
    photo: 'marynia.jpg',
    link: 'https://github.com/Makosak'
  },
  {
    name:'Susan Paykin',
    photo: 'susan.jpg',
    link: 'https://github.com/spaykin'
  },
  {
    name:'Qinyun Lin',
    photo: 'qlin.jpg',
    link: 'https://github.com/linqinyu'
  },
  {
    name:'Dylan Halpern',
    photo: 'dylan.jpg',
    link: 'https://github.com/nofurtherinformation'
  }
]

export default function About() {
  return (
    <div className={styles.container}>
      <Head>
        <title>About :: OEPS </title>
        <meta name="description" content="Generated by create next app" />
        <script defer data-domain="oeps.healthyregions.org" src="https://plausible.io/js/script.js"></script>
        <link rel="icon" href="/favicon.ico" />

      </Head>
      <MainNav />
      <main className={styles.main}>
        <h1 className={styles.title}>About OEPS</h1>
        <Gutter em={2} />
        <div className="row">
          <div className="col-xs-12 col-md-4 col-lg-3">
            <h2>About</h2>
          </div>
          <div className="col-xs-12 col-md-8 col-lg-9">
            <p>
            The Opioid Environment Policy Scan (OEPS) is an open-source data warehouse to help characterize
            the multi-dimensional risk environment impacting opioid use and health outcomes across the United States.
            </p>
            <p>
             The OEPS provides access to data at multiple spatial scales, from U.S. states down to Census tracts. It is designed
            to support research seeking to study environments impacting and impacted by opioid use and opioid use disorder (OUD),
            inform public policy, and reduce harm in communities nationwide.
            </p>
            <p>
            We developed the OEPS as a free, open-source platform to aggregate and share publicly-available data at the Census tract, zip code, county, and state levels.
            Geographic boundary shapefiles are provided for ease of merging datasets (csv files) for exploration, spatial analysis, or visualization.
            <Link href="/download"> Download</Link> the entire data repository, or you can filter and download by theme or spatial scale.
            All datasets are accompanied by <Link href="/docs">documentation</Link> detailing their source data, year, and more.
            Learn more about our methods and approaches, including the risk environment framework, on the <Link href="/methods">Methodology</Link> page.
            </p>
            </div>
        </div>
        <Gutter em={2} />
            <div className="row">
          <div className="col-xs-12 col-md-4 col-lg-3">
            <h2>Open Source</h2>
          </div>
          <div className="col-xs-12 col-md-8 col-lg-9">
          <p>
            All data, metadata descriptions, and code is available on our <a href="https://github.com/GeoDaCenter/opioid-policy-scan">GitHub</a>.
            As an open source project, we encourage users to
            <a href="https://docs.github.com/en/issues/organizing-your-work-with-project-boards/tracking-work-with-project-boards/adding-issues-and-pull-requests-to-a-project-board"> add an issue </a>
            on GitHub for questions, bugs, or data requests, or <a href="https://docs.github.com/en/get-started/quickstart/fork-a-repo">fork the repo </a>
            to access locally.
            </p>
          </div>
        </div>

        <Gutter em={2} />
        <div className="row">
          <div className="col-xs-12 col-md-4 col-lg-3">
            <h2>Team</h2> <a id="team"></a>
          </div>
          <div className="col-xs-12 col-md-8 col-lg-9">
            <div className={"row " + styles.contributorsContainer}>
              {contributors.map(entry =>
                <div className="col-xs-12 col-md-3 col-lg-3" key={entry.name}>
                  <Image src={`images/team/${entry.photo}`} alt={''}/>
                  <h3><a href={entry.link}>{entry.name}</a></h3>
                  <h4>{entry.title}</h4>
                </div>)}
            </div>
            <p>
            The OEPS is led by the <a href="https://voices.uchicago.edu/herop/">Healthy Regions and Policies Lab</a> (HEROP) at the
            Center for Spatial Data Science at University of Chicago. It was developed for the <a href="https://heal.nih.gov/research/research-to-practice/jcoin">Justice Community Opioid Innovation Network (JCOIN)</a>,
            an NIH HEAL Initiative, as part of the Methodology and Advanced Analytics Resource Center (MAARC).
            Data and additional resources are also available to the JCOIN Network through the
            <a href="https://jcoin.datacommons.io/login"> JCOIN Data Commons</a>.
            </p>
            <p>
              Contributors include Moksha Menghaney and Angela Li, as well as Research Assistants (RAs)
              Margot Bolanos Gamez, Alexa Jin, Ally Muszynski, and Rachel Vigil.
            </p>
            <p>
              <a href="https://voices.uchicago.edu/herop/team/">Learn more</a> about the HEROP team.
            </p>
          </div>
        </div>
        <Gutter em={2} />
        <div className="row">
          <div className="col-xs-12 col-md-4 col-lg-3">
            <h2>Contact</h2>
          </div>
          <div className="col-xs-12 col-md-8 col-lg-9">
            <p>
            Submit an issue on <a href="https://github.com/GeoDaCenter/opioid-policy-scan">GitHub</a>,
            or email <a href="mailto:spaykin@uchicago.edu">Susan Paykin</a> with any questions.
            </p>
          </div>
        </div>
        <Gutter em={2} />
        <div className="row">
          <div className="col-xs-12 col-md-4 col-lg-3">
            <h2>Citation</h2>
          </div>
          <div className="col-xs-12 col-md-8 col-lg-9">
            <p>
            Susan Paykin, Dylan Halpern, Qinyun Lin, Moksha Menghaney, Angela Li,
            Rachel Vigil, Margot Bolanos Gamez, Alexa Jin, Ally Muszynski, and Marynia Kolak. (2022).
            GeoDaCenter/opioid-policy-scan: Opioid Environment Policy Scan (OEPS) Data Warehouse (v1.0). Zenodo.
            <a href= "https://zenodo.org/record/5842465#.YeHj8H3MKHF">https://doi.org/10.5281/zenodo.5842465</a>
            </p>
            <p>
            <i>This research was supported by the National Institute on Drug Abuse, National Institutes of Health,
            through the NIH HEAL Initiative under award number UG3DA123456.
            The contents of this publication are solely the responsibility of the authors and do not necessarily represent
            the official views of the NIH, the Initiative, or the participating sites.</i>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
