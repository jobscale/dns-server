FROM ubuntu:22.04
SHELL ["bash", "-c"]
WORKDIR /root
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y \
    locales curl git vim iproute2 dnsutils netcat less \
    openssh-server dnsmasq
RUN rm -fr /var/lib/apt/lists/*
RUN sed -i -e 's/# ja_JP.UTF-8 UTF-8/ja_JP.UTF-8 UTF-8/' /etc/locale.gen && locale-gen && update-locale LANG=ja_JP.UTF-8 \
 && echo -e "export LANG=ja_JP.UTF-8\nexport TZ=Asia/Tokyo\numask u=rwx,g=rx,o=rx" | tee -a /etc/bash.bashrc

RUN echo 'cat /etc/passwd | grep "^$(whoami)" | cut -d: -f6' > home
RUN echo home = $(. home)
RUN ssh-keygen -t ed25519 -N "" -C "$(whoami)@$(hostname)" -f $(. home)/.ssh/id_ed25519
RUN cat $(. home)/.ssh/id_ed25519.pub | tee -a $(. home)/.ssh/authorized_keys

RUN echo "expand-hosts" | tee -a /etc/dnsmasq.d/custom.conf

COPY docker-entrypoint /
ENTRYPOINT ["/docker-entrypoint"]
EXPOSE 53/tcp 53/udp
