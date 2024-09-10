import Head from "next/head";
import { useState, useMemo } from 'react';
import styles from "../styles/Docs.module.css";
import { Gutter } from "../components/layout/Gutter";
import MainNav from "../components/layout/MainNav";
import Footer from "../components/layout/Footer";
import csvFiles from '../meta/csvFiles.json';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

const years = [
  '1980',
  '1990',
  '2000',
  '2010',
  'Latest'
]

const uniqueScales = [
  'State',
  'County',
  'Tract',
  'Zip'
]

const scalesDict = {
    'S':'State',
    'C':'County',
    'T':'Tract',
    'Z':'Zip'
}

const shpParts = ['.dbf','.prj','.shp', '.shx','.cpg']

const geomsDict = [{
    agg: 'State',
    year: "Latest",
    folder: 'geometryFiles/state/',
    baseFileName: 'states2018'
  },{
    agg: 'County',
    year: "Latest",
    folder: 'geometryFiles/county/',
    baseFileName: 'counties2018'
  },{
    agg: 'Tract',
    year: "Latest",
    folder: 'geometryFiles/tract/',
    baseFileName: 'tracts2018'
  },{
    agg: 'Zip',
    year: "Latest",
    folder: 'geometryFiles/zcta/',
    baseFileName: 'zctas2018'
 },{
  agg: 'State',
  year: "2010",
  folder: 'geometryFiles/state/',
  baseFileName: 'states2010'
},{
  agg: 'County',
  year: "2010",
  folder: 'geometryFiles/county/',
  baseFileName: 'counties2010'
},{
  agg: 'Tract',
  year: "2010",
  folder: 'geometryFiles/tract/',
  baseFileName: 'tracts2010'
 }
]

const BASE_CSV_URL = 'https://raw.githubusercontent.com/GeoDaCenter/opioid-policy-scan/main/data_final/'

export default function Download() {
  const [downloadMessage, setDownloadMessage] = useState('')
  const [zipPct, setZipPct] = useState(-1)
  const [activeFilters, setActiveFilters] = useState({
    scale: [],
    year: []
  })

    const MainHead = () => useMemo(() => <Head>
        <title>Download :: OEPS </title>
        <meta name="description" content="Generated by create next app" />
        <script defer data-domain="oeps.healthyregions.org" src="https://plausible.io/js/script.js"></script>
        <link rel="icon" href="/favicon.ico" />

    </Head>,[])

    const handlefilter = (val, type) => {
        setActiveFilters(prev => {
        let previousType = prev[type].length ? [...prev[type]] : [];
        let parsed = previousType.includes(val)
            ? [...previousType.slice(0, previousType.indexOf(val)), ...previousType.slice(previousType.indexOf(val)+1, previousType.length)]
            : [...previousType, val]

        return {
            ...prev,
            [type]: parsed
        }
        })
    }

    const handleDownload = async () => {
      setDownloadMessage('Starting download...')
      let filesToDownload = [...csvFiles]

      if (activeFilters.scale.length) {
        filesToDownload = filesToDownload.filter(entry => activeFilters.scale.includes(scalesDict[entry.scale]))
      }

      if (activeFilters.year.length) {
        filesToDownload = filesToDownload.filter(entry => activeFilters.year.includes(entry.year))
      }

      let geomsToDownload = [...geomsDict]
//      if (activeFilters.year.length !== 0 && !activeFilters.year.includes('Geographic Boundaries')){
//        geomsToDownload = []
//      }
      
      if (activeFilters.scale.length){
        geomsToDownload = geomsToDownload.filter(f => activeFilters.scale.includes(f.agg))
      }

      if (activeFilters.year.length){
        let historic_data_requested = activeFilters.year.some(yr => ['2010', '2000', '1990', '1980'].includes(yr))
        geomsToDownload = geomsToDownload.filter(f => activeFilters.year.includes(f.year) || (historic_data_requested && f.year === '2010'))
      }

      let geomPromises = [];
      geomsToDownload.forEach(geometry => {
        shpParts.forEach(shpPart => {
          geomPromises.push(fetch(BASE_CSV_URL + geometry.folder + geometry.baseFileName + shpPart).then(r=>r.blob()))
        })
      })

      // declare promises
      const dataPromises = filesToDownload.map(entry => fetch(BASE_CSV_URL + entry.folder + entry.file + '.csv').then(r=>r.blob()))
      const docsLinks = await fetch('https://api.github.com/repos/geodacenter/opioid-policy-scan/contents/data_final/metadata').then(r=>r.json()).then(items => items.map(d => ({'name':d.name, 'url': d.download_url})).filter(f => f.url !== null))
      const docsPromises = await docsLinks.map(link => fetch(link.url).then(r=>r.blob()))

      // fetch data and docs
      const docs = await Promise.all(docsPromises).then(values => values.map((v,i) => ({'name':docsLinks[i].name, 'data':v})))
      setDownloadMessage(`Downloaded ${docs.length} documentation files. Downloading ${filesToDownload.length} CSV files...`)
      const data = await Promise.all(dataPromises).then(values => values.map((v,i) => ({'name':`${filesToDownload[i].file}.csv`, 'data':v})))
      setDownloadMessage(`Downloaded ${data.length} CSV files. Downloading ${geomsToDownload.length} geometr${geomsToDownload.length > 1 ? 'ies' : 'y'}...`)
      const geom = await Promise.all(geomPromises).then(values => values.map((v,i) => ({'name':`${geomsToDownload[Math.floor(i/7)].baseFileName}${shpParts[i%5]}`, 'data':v})))

      var zip = new JSZip();
      var dataFolder = zip.folder("data");
      var docsFolder = zip.folder("docs");
      var geomFolder = zip.folder("geometry");

      data.forEach(d => dataFolder.file(d.name, d.data))
      docs.forEach(d => docsFolder.file(d.name, d.data))
      geom.forEach(d => geomFolder.file(d.name, d.data))
      setDownloadMessage(`Building your ZIP archive, this may take a minute...`)

      zip.generateAsync(
        {
          type:"blob",
          compression: "STORE",
      }, (meta) => setZipPct(meta.percent)).then(content => {
        saveAs(content, `OEPS_DOWNLOAD_${new Date().toISOString().slice(0,10)}.zip`);
      }).then(() => {setDownloadMessage(''); setZipPct(-1)})
    }

  return (
    <div className={styles.container}>
      <MainHead />
      <MainNav />
      <main className={styles.main}>
        <h1 className={styles.title}>Data Download & Access</h1>
        <Gutter em={1} />
        <p>Download all data, or select particular topics or geographic scales.</p>  
        <div className={styles.downloadsContainer}>
          <div>          
            <a className={styles.fullDownload} href="">Download all data <span>CSVs and Data Dictionaries</span></a>
          </div>
          <div>
            <a className={styles.fullDownload} href="https://github.com/GeoDaCenter/opioid-policy-scan/zipball/v1.0">Download all data <span>Full GitHub Archive</span></a>
          </div>
          <div>
            <a className={styles.fullDownload} href="">Download all data<span>Frictionless Data Package (v1)</span></a>
          </div>
          <div>
            <a className={styles.fullDownload} href="https://docs.google.com/forms/d/e/1FAIpQLSfTfrxpCoXeHEJMZ9mwRLNlFkWCxLzew_1ayEofK5W59VNKMw/viewform?usp=sf_link"> Google BigQuery <span>Request Access key</span></a>
          </div>
        </div>
        <Gutter em={5} />
        
        <h2>Filter Data and Download</h2>
        
        <div className="row">
          <div className="col-xs-12 col-md-8">
            <h3>Filter by Year</h3>
            {years.map(year => <button key={year} onClick={() => handlefilter(year, 'year')} className={`${styles.filterButton} ${activeFilters.year.includes(year) ? styles.activeDownload : ' '}`}>{year}</button>)}
          </div>
          <div className="col-xs-12 col-md-4">
            <h3>Filter by Scale</h3>
            {uniqueScales.map(scale => <button key={scale} onClick={() => handlefilter(scale, 'scale')} className={`${styles.filterButton} ${activeFilters.scale.includes(scale) ? styles.activeDownload : ' '}`}>{scale}</button>)}
          </div>
        </div>
        <Gutter em={4} />
        {downloadMessage.length ? <div>
            <img src='/images/globe_min.svg' className={styles.loader} alt={''} />
            <h4>{downloadMessage}</h4>
            {zipPct > -1 && <div className={styles.progressContainer}>
              <span className={styles.progressBar} style={{width: `${zipPct}%`}}/>
            </div>}
        </div> : null}
        <button className={`${downloadMessage.length !== 0 ? styles.passiveButton : ''} ${styles.downloadButton}`} onClick={handleDownload} disabled={downloadMessage.length !== 0}>Download Selected Data</button>

      </main>
      <Footer />
    </div>
  );
}
