import os
import json
import numpy
import shutil
import pandas as pd
import geopandas as gpd
from pathlib import Path

from oeps.utils import get_path_or_paths, download_path


def create_package(operation, destination, source, zip_):
    """Commands related to JCOIN export."""


    dest = Path(destination)
    dest.mkdir(exist_ok=True)
    s_path = Path(dest, "schemas")
    s_path.mkdir(exist_ok=True)
    d_path = Path(dest, "data")
    d_path.mkdir(exist_ok=True)

    if not os.path.isdir(destination):
        os.mkdir(destination)

    data_package = {
        "profile": "data-package",
        "name": "oeps",
        "title": "Opioid Environment Policy Scan (OEPS) v2",
        "homepage": "https://oeps.healthyregions.org",
        "resources": [],
        "licenses": [{
            "name": "ODC-PDDL-1.0",
            "path": "http://opendatacommons.org/licenses/pddl/",
            "title": "Open Data Commons Public Domain Dedication and License v1.0"
        }]
    }

    resources = get_path_or_paths(source, extension="json")
    resources.sort()

    for i in resources:

        i_path = Path(i)
        print(f"processing schema: {i_path.name}")
        with open(i, "r") as f:
            data = json.load(f)

        out_filename = f"{data['name']}{i_path.suffix}"
        out_relpath = f"schemas/{out_filename}"
        out_abspath = Path(s_path, out_filename)

        # copy the data files and generate the list of local paths
        local_paths = download_path(data.pop("path"), d_path)

        # create the resource item that will be placed in the data package json
        paths = [f"data/{i.name}" for i in local_paths]
        res_item = {
            "name": data.get('name', ''),
            "title": data.get('title', ''),
            "description": data.get('description', ''),
            "path": paths,
            "schema": out_relpath
        }
        data_package['resources'].append(res_item)

        # now create the schema that will be stored in the separate data resource file
        out_schema = {
            "primaryKey": data['schema'].get('primaryKey'),
            "fields": [],
        }
        
        # rebuild the field list here with only the necessary props
        props = ['name', 'title', 'type', 'example', 'description']
        for df in data['schema']["fields"]:
            f = {}
            for p in props:
                if df.get(p):
                    f[p] = df.get(p)
            out_schema['fields'].append(f)

        # finally, for csv resources generate foreignKeys linking back to the proper geometry files
        if res_item['path'][0].endswith(".csv"):

            # figure out which shapefile...
            scale, year = res_item['name'].split("-")

            year_to_use = "2018" if year == "Latest" else "2010"
            if scale == "T":
                resname = f"tracts-{year_to_use}"
            elif scale == "Z":
                resname = f"zctas-{year_to_use}"
            elif scale == "C":
                resname = f"counties-{year_to_use}"
            elif scale == "S":
                resname = f"states-{year_to_use}"
            else:
                print(res_item)
                raise Exception("unanticipated res_item['name']")

            out_schema['foreignKeys'] = [{
                'fields': 'HEROP_ID',
                'reference': {
                    'resource': resname,
                    'fields': 'HEROP_ID',
                }
            }]

        with open(out_abspath, "w") as f:
            json.dump(out_schema, f, indent=4)

    package_json_path = Path(dest, "data-package.json")
    with open(package_json_path, "w") as f:
        json.dump(data_package, f, indent=4)

    if zip_:
        print("zipping output...")
        shutil.make_archive(f"{Path(dest.parent, dest.name)}", 'zip', dest)

    print("  done.")


class DataResource():

    def __init__(self, resource_file=None):

        if resource_file:
            with open(resource_file, "r") as o:
                data = json.load(o)
            self.schema = data
        else:
            self.schema = None

    def oeps_type_to_schema_type(self, s):
        """ Convert the type stored in the data dictionary to one that aligns
        with the table schema. """

        if s == "Integer":
            return 'integer'
        elif s in ['Date', 'String', 'Character / Factor', 'String / Factor']:
            return 'string'
        elif s == 'Boolean':
            return 'boolean'
        elif s in ['Float', 'Double', 'Numeric']:
            return 'number'
        else:
            raise TypeError("unrecognized type " + s + ".")

    def oeps_type_to_bq_type(self, s):
        """ Convert the type stored in the data dictionary to one that aligns
        with the big query data type list. """

        if s == "Date":
            return "DATE"
        elif s in ["Character / Factor", "String / Factor"]:
            return "STRING"
        elif s == "Binary":
            return "BOOLEAN"
        else:
            return s.upper()

    def make_field_entry(self, data_dict_row):
        """ Compose a full field entry from a row of an oeps data dict. """

        field = {
            'name': data_dict_row.loc['Variable'],
            'src_name': data_dict_row.loc['Variable'],
            'type': self.oeps_type_to_schema_type(data_dict_row.loc['Type']),
            'example': str(data_dict_row.loc['Example']),
            'description': data_dict_row.loc['Description'],
            'constraints': data_dict_row.loc['Data Limitations'],
            'theme': data_dict_row.loc['Theme'],
            'source': data_dict_row.loc['Source Long'],
            'comments': data_dict_row.loc['Comments'],
            'bq_data_type': self.oeps_type_to_bq_type(data_dict_row.loc['Type'])
        }

        # fix float('nan') ("not a number") values which seem to pop up.
        # checking if a value equals itself is the best test for NaN (?!)
        for k in field:
            if field[k] != field[k]:
                field[k] = None
        return field

    def make_fields(self, data_dict):
        """ make_fields takes in a Pandas DataFrame with
        Variable, Type, Example, Description, Data Limitations,
        Theme, Source Long, and Comments columns and returns a
        "fields" array for the data dictionary.  """

        SKIP_FIELDS = [
            'GEOID',
            'G_STATEFP',
            'STUSPS',
            'TRACTCE',
            'STATEFP',
            'COUNTYFP',
            'ZIP',
        ]

        fields = []

        for row in range(0, len(data_dict)):

            if data_dict.iloc[row].loc['Variable'] in SKIP_FIELDS:
                continue
            fields.append(self.make_field_entry(data_dict.iloc[row]))

        return fields

    def create_from_oeps_xlsx_data_dict(self, xlsx_file, dest_directory):
        """ Creates a schema from our pre-made external data dictionaries. """

        REPO_BASE_URL = "https://raw.githubusercontent.com/GeoDaCenter/opioid-policy-scan/main/data_final/full_tables"
        GY_LOOKUP = {
            'S': [1980, 1990, 2000, 2010, 'Latest'],
            'C': [1980, 1990, 2000, 2010, 'Latest'],
            'T': [1980, 1990, 2000, 2010, 'Latest'],
            'Z': ['Latest'],
        }
        GEO_LOOKUP = {
            "S": "State",
            "C": "Census Tract",
            "T": "County",
            "Z": "Zip-Code Tabulation Area (ZCTA)",
        }

        #### Script ----
        geo = os.path.basename(xlsx_file).split("_")[0]

        output_files = []

        def _generate_title(geo, year):
            
            try:
                title = f"OEPS Data Aggregated by {GEO_LOOKUP[geo]} ({year})"
            except KeyError:
                raise KeyError(f"invalid geography {geo}")

            return title
        
        def _generate_description(geo, year):

            try:
                desc = f"This CSV aggregates all {year} data variables from the OEPS v2 release at the {GEO_LOOKUP[geo]} level."
            except KeyError:
                raise KeyError(f"invalid geography {geo}")

            return desc

        # Create and save a table for each pair.
        for year in GY_LOOKUP[geo]:

            # Generate the relevant path.
            csv_name = f'{geo}_{year}.csv'
            print(f'making table definition for {csv_name}!')

            # Path to the CSV dataset itself
            dataset_path = os.path.join('csv', csv_name)
            dataset_path = f"{REPO_BASE_URL}/{csv_name}"

            # Read in data
            data_dict = pd.read_excel(xlsx_file)

            # Filter to only relevant rows
            data_dict = data_dict[(data_dict[year] == 'x')]

            dataset = "tabular"

            title = _generate_title(geo, year)
            description = _generate_description(geo, year)

            self.schema = {
                'bq_dataset_name': dataset,
                'bq_table_name':  f'{geo}_{year}',
                'name': f'{geo}-{year}',
                'path': dataset_path,
                'title': title,
                'description': description,
                'schema': {
                    'primaryKey': 'HEROP_ID',
                    'fields': self.make_fields(data_dict)
                }
            }

            out_path = os.path.join(dest_directory, f'{dataset}_{geo}_{year}.json')
            self.export_schema(out_path)

            output_files.append(out_path)

        return output_files

    def export_schema(self, path):
        """ Dump this object's schema to a JSON file. """
            
        with open(path, 'w') as outfile:
            json.dump(self.schema, outfile, indent=4)

    def load_rows_from_file(self):
        """Loads all data from the file indicated in the provided schema, and
        performs some data validation and cleaning along the way.

        Returns a list of serialized JSON strings, and a list of error messages"""

        rows, errors = [], []

        dataset_path = self.schema['path']

        try:
            if dataset_path.endswith('.shp'):
                df = gpd.read_file(dataset_path)
            elif dataset_path.endswith('.csv'):
                # set all columns as object type
                df = pd.read_csv(dataset_path, dtype='object')
            else:
                print(f"Invalid dataset: {dataset_path}")
                return
        except Exception as e:
            errors.append(str(e))
            return rows, errors

        # use any src_name properties to rename columns where needed
        field_mapping = {}
        for f in self.schema['schema']['fields']:
            src_name = f.get('src_name')
            if src_name:
                field_mapping[src_name] = f['name']
            else:
                errors.append(f"warning: {f['name']} missing required src_name attribute")
        if field_mapping:
            df.rename(columns=field_mapping, inplace=True)

        # remove any input columns that are not in the schema
        drop_columns = [i for i in df.columns if i not in field_mapping.values()]
        if drop_columns:
            errors.append(f"{len(drop_columns)} source columns missing from schema: " + \
                        ", ".join(drop_columns))
        df.drop(columns=drop_columns, inplace=True)

        # check for schema columns that are not found in the source data
        missing_columns = [i for i in field_mapping.values() if i not in df.columns]
        if missing_columns:
            errors.append(f"{len(missing_columns)} schema fields missing from source: " +\
                        ", ".join(missing_columns))

        # iterate fields and zfill columns where needed
        for f in self.schema['schema']['fields']:
            if f.get('zfill', False) is True:
                df[f['name']] = df[f['name']].apply(lambda x: str(x).zfill(f['max_length']))

        field_types = {f['name']: f['type'] for f in self.schema['schema']['fields']}

        # iterate the dataframe and turn each row into a dict that gets appened to rows.
        # this list is later loaded as if it were a newline-delimited JSON file.
        rows = []
        for i in df.index:
            row = {col: df.at[i, col] for col in df.columns if not col == "geom"}

            # cast all values to strings for string fields. necessary because some
            # NULL shapefile attribute values were interpreted as float('nan'), which
            # breaks json parsing
            for k in row:
                val_str = str(row[k])
                # test for float('nan') type, set to None
                if val_str == 'nan':
                    row[k] = None
                if "NA" in val_str:
                    row[k] = None
                # handle some infinite number variations
                if 'inf' in val_str.lower():
                    row[k] = None
                if row[k]:
                    if field_types[k] == "string":
                        row[k] = val_str
                    if field_types[k] == "integer":
                        try:
                            row[k] = int(row[k])
                        except ValueError:
                            # special handle string values like '23493.3434'
                            row[k] = int(round(float(row[k])))
                    if field_types[k] == "number":
                        row[k] = float(row[k])
                    if field_types[k] == "boolean":
                        if row[k] in [1, "1", "Yes", "YES", "yes", True, 'True', 'TRUE', 'true']:
                            row[k] = True
                        elif row[k] in [0, "0", "No", "NO", "no", False, 'False', 'FALSE', 'false']:
                            row[k] = False
                        else:
                            row[k] = None

            # handle geometry column by dumping it to GeoJSON string. this fixes
            # some Polygon format errors that occurred with the default WKT that
            # GeoPandas returns for shapes. geom.__geo_interface__ is a shapely thing.
            if 'geom' in df.columns:
                row['geom'] = json.dumps(df.at[i, 'geom'].__geo_interface__)
            try:
                rows.append(json.dumps(row))
            except Exception as e:
                for k, v in row.items():
                    print(field_types[k])
                    print(k, v, type(v))
                    print(isinstance(v, numpy.int64))
                raise(e)

        return rows, errors