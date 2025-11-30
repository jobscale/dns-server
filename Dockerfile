FROM node:lts-tixie-slim
SHELL ["bash", "-c"]
WORKDIR /home/node
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    locales curl git vim iproute2 dnsutils netcat-openbsd less \
    dnsmasq \
 && apt-get clean && rm -fr /var/lib/apt/lists/*
RUN sed -i -e 's/# ja_JP.UTF-8 UTF-8/ja_JP.UTF-8 UTF-8/' /etc/locale.gen && locale-gen && update-locale LANG=ja_JP.UTF-8 \
 && echo -e "export LANG=ja_JP.UTF-8\nexport TZ=Asia/Tokyo\numask u=rwx,g=rx,o=rx" | tee -a /etc/bash.bashrc

COPY --chown=node:staff custom.conf /etc/dnsmasq.d/custom.conf
COPY docker-entrypoint /
COPY --chown=node:staff index.js .
ENTRYPOINT ["/docker-entrypoint"]
EXPOSE 53/tcp 53/udp
