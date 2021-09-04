const { fromEvent, from } = rxjs
const { map, filter, distinctUntilChanged, debounceTime, switchMap } = rxjs.operators

async function getUser(user) {
    const response = await fetch(`https://api.github.com/users/${user}`)
    return response.json()
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input')
    const result = document.getElementById('result')

    fromEvent(input, 'keyup')
        .pipe(map(e =>  e.target.value))
        .pipe(filter(q => q.length > 2))
        .pipe(debounceTime(500))
        .pipe(distinctUntilChanged())
        .pipe(switchMap(user => 
            from(getUser(user))
        ))
        .pipe(map(res => ({ username: res.login, repoCount: res.public_repos, bio: res.bio  })))
        .subscribe(({ username, repoCount, bio }) => {
            const isNotFound = username == null && repoCount == null && bio == null
            result.innerHTML = ''

            if (!isNotFound) {
                input.value = ''
            }

            const title = document.createElement('h3')
            title.innerText = `Username: ${username ?? 'User not found'}`

            const repos = document.createElement('h3')
            repos.innerText = `Repos: ${repoCount ?? 'User not found'}`

            const userBio = document.createElement('p')
            userBio.innerText = `Bio: ${bio ?? 'None'}`

            result.appendChild(title)
            result.appendChild(repos)
            result.appendChild(userBio)
        })
})