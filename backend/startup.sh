#!/bin/bash
export PYTHONPATH=/home/site/wwwroot/__oryx_packages__:$PYTHONPATH
python -m gunicorn --bind=0.0.0.0 --timeout 600 main:app -k uvicorn.workers.UvicornWorker
