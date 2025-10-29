const API_BASE_URL = 'https://rickandmortyapi.com/api';

const MATRICULA = '443589'; 

const LOG_API_BASE_URL = 'https://www.piway.com.br/unoesc/api/';
const ENDPOINT_EXIBIR = `${LOG_API_BASE_URL}logs/${MATRICULA}`;
const ENDPOINT_EXCLUIR_BASE = `${LOG_API_BASE_URL}excluir/log`;


async function registerLog(apiName, method, result, error = null) {
    
    const logResult = error ? `ERRO: ${error.message}` : String(result);
    
    const encodedApiName = encodeURIComponent(apiName);
    const encodedMethod = encodeURIComponent(method);
    const encodedResult = encodeURIComponent(logResult);
    
    const url = `${LOG_API_BASE_URL}inserir/log/${MATRICULA}/${encodedApiName}/${encodedMethod}/${encodedResult}`;

    try {
        const response = await fetch(url); 

        if (!response.ok) {
            console.error(`Erro ${response.status} ao registrar log na API de Logs.`);
        } else {
            const data = await response.json();
            if (data.SUCESSO) {
            } else {
                console.error('Resposta de erro da API de Logs:', data.ERRO);
            }
        }

    } catch (logError) {
        console.error('Erro de rede ao tentar registrar log:', logError);
    }
}



async function fetchLogs() {
    const logListContainer = document.getElementById('log-list-container');
 
    if (!logListContainer) {
        console.error('Elemento log-list-container não encontrado.');
        return;
    }

    logListContainer.innerHTML = '<p>Carregando logs...</p>';

    const url = ENDPOINT_EXIBIR; 
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar logs: ${response.status}`);
        }
        
        const logs = await response.json();

        const logList = logs.SUCESSO || [];
        
        if (Object.keys(logList).length === 0) { 
            logListContainer.innerHTML = '<p>Nenhum log registrado ainda.</p>';
            return;
        }

        logListContainer.innerHTML = '';
        
        const finalLogs = Object.keys(logList).map(key => ({ id: key, ...logList[key] }));

        finalLogs.reverse().forEach(log => { 
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            

            logItem.innerHTML = `
                <div class="log-info">
                    <p><strong>ID:</strong> ${log.id || 'N/A'}</p>
                    <p><strong>API:</strong> ${log.API}</p>
                    <p><strong>Método:</strong> ${log.METODO}</p>
                    <p><strong>Resultado:</strong> ${log.RESULTADO}</p>
                    <p><strong>Data:</strong> ${new Date(log.DATA_INSERCAO).toLocaleString()}</p>
                </div>
                <button class="log-delete-btn" onclick="deleteLog('${log.id}')">Excluir</button>
            `;
            logListContainer.appendChild(logItem);
        });

    } catch (error) {
        console.error('Erro ao buscar logs:', error);
        logListContainer.innerHTML = `<p style="color: red;">Ocorreu um erro ao carregar os logs: ${error.message}. Verifique se sua matrícula (${MATRICULA}) está correta e ativa.</p>`;
    }
}

async function deleteLog(logId) {
    if (!confirm(`Tem certeza que deseja excluir o log ID ${logId}?`)) {
        return;
    }

    const url = `${ENDPOINT_EXCLUIR_BASE}/${logId}/aluno/${MATRICULA}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro ao excluir log: ${response.status}`);
        }

        const data = await response.json();

        if (data.SUCESSO) {
            alert(data.SUCESSO);
        } else if (data.ERRO) {
             alert(`Falha ao excluir log: ${data.ERRO}`);
        }
        

        fetchLogs();

    } catch (error) {
        console.error('Erro ao excluir log:', error);
        alert(`Falha ao excluir log (erro de rede): ${error.message}`);
    }
}


async function fetchCharacters() {
    const characterName = document.getElementById('character-name-filter')?.value || '';
    const characterListDiv = document.getElementById('character-list');

    if (!characterListDiv) return;

    characterListDiv.innerHTML = '<p>Carregando personagens...</p>';
    const endpoint = `/character/?name=${encodeURIComponent(characterName)}`;
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                characterListDiv.innerHTML = '<p>Nenhum personagem encontrado com o nome digitado.</p>';
                await registerLog('Rick and Morty', `GET ${endpoint}`, 0, new Error("404 Nenhum resultado")); 
            } else {
                const error = new Error(`${response.status}`);
                await registerLog('Rick and Morty', `GET ${endpoint}`, 0, error); 
                throw error;
            }
            return;
        }

        const data = await response.json();
        
        const count = data.results.length;
        // Registro de Log de SUCESSO
        await registerLog('Rick and Morty', `GET ${endpoint}`, `${count} personagens`); 

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
        if (characterListDiv.innerHTML.indexOf('Ocorreu um erro') === -1) {
             characterListDiv.innerHTML = `<p>Ocorreu um erro ao carregar os dados: ${error.message}</p>`;
        }
    }
}

async function fetchRandomLocation() {
    const locationDetailsDiv = document.getElementById('location-details');
    if (!locationDetailsDiv) return;

    locationDetailsDiv.innerHTML = '<p>Buscando localização...</p>';
    
    let endpoint = '/location';
    try {
        let response = await fetch(`${API_BASE_URL}${endpoint}`);
        let data = await response.json();
        const maxLocations = data.info.count;
        
        const randomId = Math.floor(Math.random() * maxLocations) + 1;

        endpoint = `/location/${randomId}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`);
        
        if (!response.ok) {
            const error = new Error(`${response.status}`);
            await registerLog('Rick and Morty', `GET ${endpoint}`, 0, error); 
            throw error;
        }
        
        const location = await response.json();
        
        await registerLog('Rick and Morty', `GET ${endpoint}`, `Localização: ${location.name}`); 

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
    if (!episodeDetailsDiv) return;

    episodeDetailsDiv.innerHTML = '<p>Buscando episódio...</p>';

    let endpoint = '/episode';
    try {
        let response = await fetch(`${API_BASE_URL}${endpoint}`);
        let data = await response.json();
        const maxEpisodes = data.info.count;
        
        const randomId = Math.floor(Math.random() * maxEpisodes) + 1;

        endpoint = `/episode/${randomId}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`);
        
        if (!response.ok) {
            const error = new Error(`${response.status}`);
            await registerLog('Rick and Morty', `GET ${endpoint}`, 0, error); 
            throw error;
        }
        
        const episode = await response.json();
        
       
        await registerLog('Rick and Morty', `GET ${endpoint}`, `Episódio: ${episode.episode}`); 

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


document.addEventListener('DOMContentLoaded', () => {

    fetchCharacters(); 
    
    const modal = document.getElementById('log-modal');
    const btn = document.getElementById('open-log-modal-btn');
    const span = document.getElementsByClassName('close-button')[0];

    if (btn && modal && span) {
        btn.onclick = function() {
            modal.style.display = 'block';
            
            fetchLogs();
        }

        span.onclick = function() {
            modal.style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    } else {
         console.warn("Elementos do modal (log-modal, open-log-modal-btn ou close-button) não encontrados no HTML.");
    }
});