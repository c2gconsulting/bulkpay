############################################################
# Dockerfile to build the Meteor microservice container image
# Based on meteorhacks/meteord
############################################################

# Set the base image to MeteorD
FROM meteorhacks/meteord:onbuild
RUN apt-get update \
          && apt-get install -y --no-install-recommends \
                  openjdk-7-jre-headless \
                  graphicsmagick \
                  libicu48 \
          && rm -rf /var/lib/apt/lists/*

# File Author / Maintainer
MAINTAINER C2G Consulting

