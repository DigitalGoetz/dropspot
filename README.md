# Dropspot

This is a quick and insecure means of sharing files between systems with a nice web interface.  Run locally it makes it easy to get files back and forth between two hosts.  Not meant for production

## Create Docker Image

```bash
bash scripts/build.sh
```

## Run Docker Image

```bash
bash scripts/run.sh
```

## Alternatively, use the image on Dockerhub

```bash
docker run -it --rm -p 4500:4500 digitalgoetz/dropspot:0.0.4
```

