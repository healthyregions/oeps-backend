import Head from "next/head";
import styles from "../styles/About.module.css";
import { Gutter } from "../components/layout/Gutter";
import MainNav from "../components/layout/MainNav";
import Footer from "../components/layout/Footer";

export default function About() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Data Standards :: OEPS </title>
        <meta name="description" content="Generated by create next app" />
        <script defer data-domain="oeps.healthyregions.org" src="https://plausible.io/js/script.js"></script>
        <link rel="icon" href="/favicon.ico" />

      </Head>
      <MainNav />
      <main className={styles.main}>
        <h1 className={styles.title}>Data Standards</h1>

      <Gutter em={3} />

        <div className="row">
          <div className="col-xs-12 col-md-4 col-lg-3">
            <h2> File Names </h2>
          </div>
          <div className="col-xs-12 col-md-8 col-lg-9">
            <p>
            All final .csv datasets are named using the following convention:
            </p>
            <p>
            <i>[Theme Abbreviation][2-digit number]_[Spatial Scale].csv</i>
            </p>
            <p>
            For example, the Policy theme dataset on Prison Incarceration Rates (PS01) at the county-level is
            <i> PS01_C.csv</i>. The same dataset at the state level is <i>PS01_S.csv</i>, at the tract-level would be <i>PS01_T.csv</i>,
             and at the zip code level would be <i>PS01_Z.csv</i>.
            </p>
            <p>
                <h4>Theme Abbreviations:</h4>
               <ul>
                   <li>Policy: PS</li>
                   <li>Health: Health*, Access*</li>
                   <li>Demographic: DS</li>
                   <li>Economic: EC</li>
                   <li>Physical Environment: BE</li>
                   <li>COVID-19: COVID</li>
               </ul>
            </p>
            <p>
            <i>* Variables labeled “Health” include: Drug-Related Death rate, Hepatitis C, Physicians.
            Variables labeled “Access” include: Access to MOUDs, Health Centers, Hospitals,
            Mental Health Providers, Pharmacies, Substance Use Treatment Facilities, Opioid Treatment Programs.
            </i>
            </p>
            <p>
                <h4> Spatial Scales: </h4>
                <ul>
                    <li>Tract: T</li>
                    <li>Zip/ZCTA: Z</li>
                    <li>County: C</li>
                    <li>State: S</li>

                </ul>
            </p>


          </div>
        </div>

      <Gutter em={2} />

      <div className="row">
          <div className="col-xs-12 col-md-4 col-lg-3">
            <h2>Geographic Identifiers</h2>
          </div>
          <div className="col-xs-12 col-md-8 col-lg-9">
            <p>
            All datasets have geographic identifiers included as a variable.
            We use the following labeling convention for each spatial scale.
            </p>
            <p>
            <table className={styles.dataTable}>
                <tbody>
                <tr>
                    <th>Variable</th>
                    <th>Variable ID</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td>State</td>
                    <td>STATEFP</td>
                    <td>2-digit State FIPS code</td>
                </tr>
                <tr>
                    <td>County</td>
                    <td>COUNTYFP</td>
                    <td>5-digit County FIPS code (state + county)</td>
                </tr>
                <tr>
                    <td>ZIP Code/ZCTA</td>
                    <td>ZCTA</td>
                    <td>5-digit assigned ZCTA </td>
                </tr>
                <tr>
                    <td>Census Tract</td>
                    <td>GEOID</td>
                    <td>11-digit unique tract ID (state + county + tract) </td>
                </tr>
                </tbody>
            </table>
            </p>
        </div>
        </div>

        <Gutter em={2} />

      <div className="row">
          <div className="col-xs-12 col-md-4 col-lg-3">
            <h2>Data Formatting</h2>
          </div>
          <div className="col-xs-12 col-md-8 col-lg-9">
            <p>
            <b>Watch for leading zeros.</b> Some geographic identifiers for states, counties, zip codes, and tracts start with “0” or “00”;
            i.e. leading zeros. However, .csv and other text file formats drop leading zeros automatically upon opening.
            This means that a state FIPS code of “02” becomes “2”, a county code of “02004” becomes “2004”,
            a zip code of “07436” becomes “7436”, etc. If you are merging .csvs with any other data by their geographic identifier,
            you will need to add in the leading zeros (or conversely, drop the leading zeros in the other file) so that they match.
            This is particularly important when you are trying to merge shapefiles, such as the geographic boundary files, with the
            .csv files.
            </p>
            <p>
            <b>Most variable names are no more than 10 characters (with some exceptions)</b> for ease of data wrangling with
            shapefiles and GIS software. Some variable names are therefore shortened or abbreviated from the source data.
            </p>
            <p>
            <b>Numeric data are rounded to the nearest tenth (two decimal places).</b>
            </p>
            <p>
           <b> Missing data are represented as “NA” or empty, depending on the language or platform you are working with.</b>
            These should not be mistaken for or confused with the numeric “0”.
            </p>

          </div>
        </div>

        <Gutter em={2} />

      <div className="row">
          <div className="col-xs-12 col-md-4 col-lg-3">
            <h2>Guidelines for Contributing</h2>
          </div>
          <div className="col-xs-12 col-md-8 col-lg-9">
            <p>
            If you are interested in contributing to the OEPS, please keep in mind the following:
            </p>
            <p>
            <ul>
                <li>Variables names should be no more than 10 characters</li>
                <li> Numeric observations should be rounded to the nearest tenth (two decimal places)</li>
                <li> Remove any index columns </li>
                <li> Remove quotations marks, commas, or other character punctuation </li>
                <li> Code missing as unavailable data as <i>NA</i> or empty </li>
            </ul>
            </p>

          </div>
        </div>

        </main>
      <Footer />
    </div>
  );
}
