CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL, -- UNIQUE, чтобы не было одинаковых логинов
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_path VARCHAR(255)
);

-- Таблица фильмов
CREATE TABLE movies (
    movie_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre INTEGER, -- В ТЗ было: 1 - action, 2 - comedy (лучше использовать INT)
    ticket_price INTEGER NOT NULL,
    age_rating INTEGER, -- Например: 12, 16, 18
    description TEXT, -- Добавил из ТЗ
    poster_path VARCHAR(255) -- Добавил из ТЗ
);

-- Таблица билетов
CREATE TABLE tickets (
    ticket_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(movie_id) ON DELETE CASCADE,
    show_date DATE NOT NULL, -- Дата сеанса
    quantity INTEGER NOT NULL CHECK (quantity > 0), -- Валидация: больше 0
    total_price INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'active' -- Одинарные кавычки!
);


-- INSERT INTO movies (title, genre, ticket_price, age_rating, description, poster_path) VALUES
-- ('Дюна: Часть вторая', 1, 3000, 12, 'Пол Атрейдес объединяется с фременами, чтобы отомстить заговорщикам, уничтожившим его семью.', 'images/posters/movie1.jpg'),
-- ('Форсаж 10', 1, 2500, 16, 'Продолжение культовой гоночной саги. Доминику Торетто предстоит защитить свою семью от нового врага.', 'images/posters/movie2.jpg'),
-- ('Джон Уик 4', 1, 2800, 18, 'Джон Уик находит способ одержать победу над Правлением Кланов, но для этого ему предстоит сразиться с новым врагом.', 'images/posters/movie3.jpg'),
-- ('Мстители: Финал', 1, 2200, 16, 'Оставшиеся в живых члены команды Мстителей и их союзники разрабатывают новый план, чтобы противостоять Таносу.', 'images/posters/movie4.jpg'),
-- ('Барби', 2, 2500, 12, 'Барби выгоняют из Барбиленда, потому что она не соответствует его нормам красоты. Она отправляется в реальный мир.', 'images/posters/movie5.jpg'),
-- ('Келинка Сабина', 2, 1500, 12, 'Городская девушка Сабина случайно попадает в аул, где ей приходится учиться быть настоящей келин.', 'images/posters/movie6.jpg'),
-- ('Один дома', 2, 1200, 6, 'Восьмилетний Кевин остается один дома на Рождество и защищает свой дом от грабителей.', 'images/posters/movie7.jpg'),
-- ('Оппенгеймер', 3, 3500, 16, 'История жизни американского физика Роберта Оппенгеймера, создателя первой атомной бомбы.', 'images/posters/movie8.jpg'),
-- ('Интерстеллар', 3, 2000, 12, 'Группа исследователей отправляется сквозь кротовую нору, чтобы найти новую планету для спасения человечества.', 'images/posters/movie9.jpg'),
-- ('Джокер', 3, 2500, 18, 'Готэм, начало 1980-х годов. Комик-неудачник Артур Флек постепенно погружается в безумие и становится преступником.', 'images/posters/movie10.jpg');

select * from movies order by ticket_price desc