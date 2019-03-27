FROM jekyll/jekyll

WORKDIR /src/hfla
RUN mkdir _site

COPY _config.yml _config.yml

EXPOSE 4000

CMD ["jekyll", "serve", "--watch", "--force_polling"]
ENTRYPOINT ["bash"]
