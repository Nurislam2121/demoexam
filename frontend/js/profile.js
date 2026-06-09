document.addEventListener("DOMContentLoaded", async (e) => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  await loadProfileData();
  initAvatarUpload();
});

const genreNames = {
  1: "Экшен",
  2: "Комедия",
  3: "Драма",
};

async function loadProfileData() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:3000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
        
    if (!response.ok) {
      alert("Сессия истекла, войдите заново");
      window.location.href = "login.html";
      return;
    }

    const data = await response.json();

    document.getElementById("profileName").innerText = data.user.full_name;
    document.getElementById("profileUserName").innerText =
      `@${data.user.username}`;

    if (data.user.avatar_path) {
      document.getElementById("avatarImg").src =
        `http://localhost:3000/${data.user.avatar_path}`;
    }

    const container = document.getElementById("history-grid");
    container.innerHTML = "";

    if (data.tickets.length === 0) {
      container.innerHTML = "<p>У вас пока нет купленных билетов.</p>";
      return;
    }

    data.tickets.forEach((t) => {
      const row = document.createElement("div");
      row.className = `history-card ${t.status}`;

      const date = new Date(t.show_date).toLocaleDateString("ru-RU");

      const genreText = genreNames[t.genre];


      row.innerHTML = `<img src="${t.poster_path}" alt="${t.title}" class="history-poster">
                    <div class="history-info">
                        <h2 class="movie-name">${t.title}</h2>
                        <div class="movie-meta">
                            <span class="tag">${genreText}</span>
                            <span class="tag">${t.age_rating}</span>
                        </div>
                        <p class="history-date">Дата сеанса: <strong>${date}</strong></p>
                        <p>Билетов: <strong>${t.quantity} шт.</strong></p>
                        <p class="total-price">Итого: ${t.total_price} ₸</p>
                        <p class="status status-active ${t.status}">Статус: ${t.status === "active" ? "Активен" : "Возвращен"}</p>
                        ${t.status === "active" ? `<button class="refund-btn" onclick="refundTicket(${t.ticket_id})">Оформить возврат</button>` : ""}
                    </div>`;
      container.appendChild(row);
    });
  } catch (err) {
    console.error(err);
  }
}

async function refundTicket(ticketID) {
    if(!confirm('Вы уверены, что хотите вернуть этот билет?')) { return }

    const token = localStorage.getItem('token')

    try {
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketID}/refund`, {
            method: "POST",
            headers: {"Authorization": `Bearer ${token}`}
        })

        const data = await response.json()

        if(response.ok) {
            alert(data.message)
            await loadProfileData()
        } else {
            alert(data.error)
        }
    } catch (err) {
        console.error(err)
    }
}

function initAvatarUpload() {
    const fileInput = document.getElementById('avatar-upload')
    if(!fileInput) return

    fileInput.addEventListener('change', async (e) => {
        const file = fileInput.files[0]
        if(!file) return

        const token = localStorage.getItem('token')
        const formData = new FormData()
        formData.append("avatar",file)

        try {
            const response = await fetch('http://localhost:3000/api/profile/avatar', {
                method: 'POST',
                headers: {'Authorization': `Bearer ${token}`},
                body: formData
            })

            const data = await response.json()
            if(response.ok) {
                alert(data.message)
                document.getElementById('avatarImg').src = `http://localhost:3000/${data.avatar_path}`
            } else {
                alert(data.error)
            }

        } catch (err) {
            console.error(err)
        }
    })
}