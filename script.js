const API_BASE_URL = 'https://rickandmortyapi.com/api';
async function fetchCharacters() {
    const characterName = document.getElementById('character-name-filter').value;
    const characterListDiv = document.getElementById('character-list');
    characterListDiv.innerHTML = '<p>Carregando personagens...</p>';
    const url = `${API_BASE_URL}/character/?name=${encodeURIComponent(characterName)}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                characterListDiv.innerHTML = '<p>Nenhum personagem encontrado com o nome digitado.</p>';
            } else {
                throw new Error(`Erro de HTTP: ${response.status}`);
            }
            return;
        }

        const data = await response.json();

        characterListDiv.innerHTML = ''; 

        data.results.forEach(character => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.innerHTML = `
                <img src="${character.image}" alt="${character.name}">
                <div class="card-info">
                    <h3>${character.name}</h3>
                    <p><strong>Status:</strong> ${character.status}</p>
                    <p><strong>Espécie:</strong> ${character.species}</p>
                    <p><strong>Origem:</strong> ${character.origin.name}</p>
                </div>
            `;
            characterListDiv.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao buscar personagens:', error);
        characterListDiv.innerHTML = `<p>Ocorreu um erro ao carregar os dados: ${error.message}</p>`;
    }
}

async function fetchRandomLocation() {
    const locationDetailsDiv = document.getElementById('location-details');
    locationDetailsDiv.innerHTML = '<p>Buscando localização...</p>';
    
    try {
        let response = await fetch(`${API_BASE_URL}/location`);
        let data = await response.json();
        const maxLocations = data.info.count;
        
        const randomId = Math.floor(Math.random() * maxLocations) + 1;

        response = await fetch(`${API_BASE_URL}/location/${randomId}`);
        if (!response.ok) throw new Error(`Erro ao buscar localização: ${response.status}`);
        
        const location = await response.json();

        locationDetailsDiv.innerHTML = `
            <p><strong>ID:</strong> ${location.id}</p>
            <p><strong>Nome:</strong> ${location.name}</p>
            <p><strong>Tipo:</strong> ${location.type}</p>
            <p><strong>Dimensão:</strong> ${location.dimension}</p>
            <p><strong>Nº de Residentes:</strong> ${location.residents.length}</p>
        `;

    } catch (error) {
        console.error('Erro ao buscar localização:', error);
        locationDetailsDiv.innerHTML = `<p>Ocorreu um erro ao carregar a localização: ${error.message}</p>`;
    }
}

async function fetchRandomEpisode() {
    const episodeDetailsDiv = document.getElementById('episode-details');
    episodeDetailsDiv.innerHTML = '<p>Buscando episódio...</p>';

    try {
        let response = await fetch(`${API_BASE_URL}/episode`);
        let data = await response.json();
        const maxEpisodes = data.info.count;
        
        const randomId = Math.floor(Math.random() * maxEpisodes) + 1;

        response = await fetch(`${API_BASE_URL}/episode/${randomId}`);
        if (!response.ok) throw new Error(`Erro ao buscar episódio: ${response.status}`);
        
        const episode = await response.json();

        episodeDetailsDiv.innerHTML = `
            <p><strong>ID:</strong> ${episode.id}</p>
            <p><strong>Nome:</strong> ${episode.name}</p>
            <p><strong>Episódio:</strong> ${episode.episode}</p>
            <p><strong>Data de Lançamento:</strong> ${episode.air_date}</p>
            <p><strong>Nº de Personagens:</strong> ${episode.characters.length}</p>
        `;
    } catch (error) {
        console.error('Erro ao buscar episódio:', error);
        episodeDetailsDiv.innerHTML = `<p>Ocorreu um erro ao carregar o episódio: ${error.message}</p>`;
    }
}
document.addEventListener('DOMContentLoaded', fetchCharacters);