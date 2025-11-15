FROM node:22.12.0
WORKDIR /app
COPY package.json /app
RUN npm install --include=dev
COPY . /app
RUN chmod +x docker-entrypoint.sh
EXPOSE 5173
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
