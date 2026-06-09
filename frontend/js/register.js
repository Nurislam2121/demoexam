document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const username = e.target.username.value.trim()
    const password = e.target.password.value.trim()
    const full_name = e.target.full_name.value.trim()

    if (!username || !password || !full_name) {
        alert('Пожалуйста заполните все поля')
        return
    }

    try {
        const resonse = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password, full_name})
        })

        const data = await resonse.json()

        if(resonse.ok) {
            alert('Регистрация прошла успешно! Теперь вы можете войти')
            window.location.href = 'login.html'
        }else {
            alert(data.error || 'Произошла ошибка при регистраций')
        }
    } catch (err) {
        console.error("Ошибка сети: ", err)
        alert('Не удалось связаться с сервером');
    }
})