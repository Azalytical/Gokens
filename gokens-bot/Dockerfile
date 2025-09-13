FROM node:20-alpine

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --omit=dev

# Копируем исходный код
COPY . .

EXPOSE 8080

# Запускаем бота
CMD ["npm", "start"]