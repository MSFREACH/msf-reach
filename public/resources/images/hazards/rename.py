#!/usr/bin/env python3
# Script for renaming incoming PDC svg files to match
# filenames reconstructured from PDC layer data

import sys, os

for filename in sys.argv[1:]:
    original_filename = filename
    filename = filename.lower();
    filename = filename.replace("pdc_","")
    filename = filename.replace("fire","wildfire")
    filename = filename.replace("disease","biomedical")

    filename = filename.replace("blue","information")
    filename = filename.replace("green","advisory")
    filename = filename.replace("yellow","watch")
    filename = filename.replace("red","warning")
    filename = filename[:-7] + ".svg"
    print(filename)
    os.rename(original_filename,filename)
