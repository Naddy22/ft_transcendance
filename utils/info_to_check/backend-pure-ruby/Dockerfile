
FROM ruby:3.0

WORKDIR /app
COPY . /app

RUN gem install bundler
RUN bundle install

CMD ["ruby", "server.rb"]
