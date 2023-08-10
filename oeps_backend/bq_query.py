import os
import argparse

from oeps_backend.utils import get_client

def run_query_from_file(path):

    project_id = os.getenv('BQ_PROJECT_ID')
    client = get_client()

    with open(path, "r") as o:
        content = o.read()
    sql = content.replace("PROJECT_ID", project_id)
    print(sql)

    query_job = client.query(sql)
    data = query_job.result()

    return data

if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("--sql-file")
    parser.add_argument("--prepared")
    parser.add_argument("--output")
    args = parser.parse_args()

    if args.sql_file:
        data = run_query_from_file(args.sql_file)

    if args.output:
        if args.output.lower().endswith(".csv"):
            df = data.to_dataframe()
            print(df.columns)
            df.to_csv(args.output, index=False)

        elif args.output.lower().endswith(".shp"):
            df = data.to_geodataframe()
            df.to_file(args.output)

        else:
            print("Invalid output type. Must be file ending in .csv or .shp.")

    else:
        # quick attempt at pretty-printing rows.
        for n, row in enumerate(data):
            if n == 0:
                print(list(row.keys()))
            clean_row = []
            for k, v in row.items():
                if k == "geom":
                    v = v.split("(")[0]
                clean_row.append(v)
            print(clean_row)
