function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (window.location.pathname.includes("profile.html") && !token) {
    alert("Для просмотра профиля необходимо войти");
    window.location.href = "login.html";
  }

  const authLink = document.getElementById("authLink");
  if (authLink) {
    if (token) {
      authLink.innerText = "Выйти";
      authLink.href = "#";
      authLink.addEventListener("click", logout);
    } else {
      authLink.innerText = "Войти";
      authLink.href = "login.html";
    }
  }
});

const genreNames = {
  1: "Экшен",
  2: "Комедия",
  3: "Драма",
};

function displayMovie(movies) {
  const container = document.getElementById("moviesList");
  container.innerHTML = "";

  movies.forEach((m) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.dataset.movie_id = m.movie_id;
    card.innerHTML = `
          <img
            src="${m.poster_path}"
            alt="${m.title}"
            class="movie-poster"
          />

          <div class="movie-content">
            <h2 class="movie-title">${m.title}</h2>

            <div class="movie-tags">
              <span class="tag genre">${genreNames[m.genre]}</span>
              <span class="tag rating">${m.age_rating}</span>
            </div>

            <p class="movie-price">Цена: <span>${m.ticket_price}</span> ₸</p>

            <form class="purchase-form">
              <div class="form-group">
                <label>Дата сеанса:</label>
                <input
                  type="date"
                  name="show_date"
                  required
                  class="input-date"
                />
              </div>

              <div class="form-group">
                <label>Количество билетов:</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value="1"
                  required
                  class="input-quantity"
                />
              </div>

              <button type="submit" class="buy-btn base-btn">
                Купить билет
              </button>
            </form>
          </div>
            `;
    container.appendChild(card);
  });
}

async function getMovie() {
  try {
    const response = await fetch("http://localhost:3000/api/movies");
    const movies = await response.json();
    displayMovie(movies);
  } catch (error) {
    console.error("Ошибка при получении фильмов:", error);
  }
}

async function updateMovies() {
  const genre = document.getElementById("genre").value;
  const rating = document.getElementById("yearsRating").value;
  const sort = document.getElementById("sortPrice").value;

  const params = new URLSearchParams({
    genre: genre,
    rating: rating,
    sort: sort,
  });

  try {
    const response = await fetch(
      `http://localhost:3000/api/movies?${params.toString()}`,
    );
    const data = await response.json();

    displayMovie(data);
  } catch (error) {
    console.error(error);
  }
}

const genre = document
  .getElementById("genre")
  .addEventListener("change", updateMovies);
const rating = document
  .getElementById("yearsRating")
  .addEventListener("change", updateMovies);
const sort = document
  .getElementById("sortPrice")
  .addEventListener("change", updateMovies);

document.getElementById("moviesList").addEventListener("submit", async (e) => {
  if (e.target.classList.contains("purchase-form")) {
    e.preventDefault();
  } 

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Для покупки билета необходимо войти в аккаунт!");
    window.location.href = "login.html";
    return;
  }

  const card = e.target.closest(".movie-card");
  const show_date = e.target.show_date.value;
  const quantity = e.target.quantity.value;

  const movie_id = card.dataset.movie_id;

  const selectedDate = new Date(show_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    alert("Дата сеанса не может быть в прошлом!");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movie_id, show_date, quantity }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error(error);
  }
});

getMovie();
