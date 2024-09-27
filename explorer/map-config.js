import * as colors from "./_webgeoda/utils/colors.js";
import variablesBase from './config/variables.json';
import variableSymbology from './config/symbology.json';

import stateData from './config/sources/state.json';
import countyData from './config/sources/county.json';
import zctaData from './config/sources/zcta.json';
import tractData from './config/sources/tract.json';

const defaultVariable = "OdMortRtAv";
const defaultData = "US States";

variablesBase.sort((a, b) => a.theme.localeCompare(b.theme));

const defaultVariableDisplay = {
  binning: "naturalBreaks",
  numberOfBins: 8,
  colorScale: "YlOrBr",
}

const addDisplayConfig = (v) => {
  const displayConfig = variableSymbology[v.nProperty] ? variableSymbology[v.nProperty] : defaultVariableDisplay;
  for (let [key, value] of Object.entries(displayConfig)) {
    v[key] = value;
  }
  if (colors.colorbrewer[v.colorScale]) {
    v.colorScale = colors.colorbrewer[v.colorScale][v.numberOfBins]
  }
  return v;
}

const variables = variablesBase.map(addDisplayConfig)

const data = [
  stateData,
  countyData,
  zctaData,
  tractData,
]

let style = {
  variableHeaders: {},
  tooltip: {
    displayOnlyCurrentVariable: true
  },
  // this layer must be present in the style defined below
  underLayerId: 'water',
  mapboxStyle: process.env.NEXT_PUBLIC_MAPBOX_STYLE
}

export const dataPresets = {
  data,
  variables,
  style,
  defaultVariable,
  defaultData
};