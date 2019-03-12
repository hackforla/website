FROM jekyll/jekyll

WORKDIR /src/hfla
RUN mkdir _site

COPY _config.yml _config.yml

EXPOSE 4000

CMD ["jekyll", "serve", "--watch", "--incremental", "--force_polling"]
ENTRYPOINT ["bash"]
