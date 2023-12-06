import os
import json
import shutil
import argparse
from glob import glob
from pathlib import Path

import requests

from oeps_backend.src.utils import get_path_or_paths, download_path
from oeps_backend.src.data_resource import DataResource

RESOURCES_DIR = os.path.join(os.path.dirname(__file__), 'resources')

if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    parser.add_argument("operation",
                        choices=[
                            "full-export",
                        ],
                        help="operation to run")
    parser.add_argument("--destination", "-d",
                        help="Output path for export. Must end with .csv for CSV or .shp for shapefile.")
    parser.add_argument("--source", "-s",
                        help="Data Resource JSON file to export, or directory with multiple files.")
    parser.add_argument("--zip",
                        action="store_true",
                        help="Zip the output directory.")
    
    args = parser.parse_args()

    if args.operation == "full-export":

        dest = Path(args.destination)
        dest.mkdir(exist_ok=True)
        s_path = Path(dest, "schemas")
        s_path.mkdir(exist_ok=True)
        d_path = Path(dest, "data")
        d_path.mkdir(exist_ok=True)

        if not os.path.isdir(args.destination):
            os.mkdir(args.destination)

        data_package = {
            "profile": "data-package",
            "name": "oeps",
            "title": "Opioid Environment Policy Scan (OEPS)",
            "homepage": "https://oeps.healthyregions.org",
            "resources": []
        }

        if args.source:
            resources = get_path_or_paths(args.source, extension="json")
        else:
            resources = get_path_or_paths(RESOURCES_DIR, extension="json")
        resources.sort()

        for i in resources:

            i_path = Path(i)
            print(f"processing schema: {i_path.name}")
            with open(i, "r") as f:
                data = json.load(f)

            local_paths = download_path(data.pop("path"), d_path)

            paths = [f"data/{i.name}" for i in local_paths]
            res_item = {
                "name": data['name'],
                "path": paths,
                "schema": f"schemas/{i_path.name}"
            }
            data_package['resources'].append(res_item)
            
            fields = []
            props = ['name', 'title', 'type', 'example', 'description']
            for df in data['schema']["fields"]:
                f = {}
                for p in props:
                    if df.get(p):
                        f[p] = df.get(p)
                fields.append(f)
            schema_out = Path(s_path, f"{data['name']}{i_path.suffix}")
            print(schema_out)
            with open(schema_out, "w") as f:
                json.dump({"fields": fields}, f, indent=4)

        package_json_path = Path(dest, "data-package.json")
        with open(package_json_path, "w") as f:
            json.dump(data_package, f, indent=4)

        if args.zip:
            print("zipping output...")
            shutil.make_archive(f"{Path(dest.parent, dest.name)}", 'zip', dest)

        print("  done.")
