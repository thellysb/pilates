// CONFIGURAÇÕES GERAIS
const CONFIG = {
    // Insira seu link de checkout abaixo
    checkoutUrl: 'https://tracking.metrito.com/mtrtprxy/link/8723abd443b89c4ab0858bc128cb021f65ad00a2',
    
    // Fluxo inicial: 
    // 'warm' = Começa com boas-vindas da Beatriz, apresentando-se antes das perguntas.
    // 'direct' = Começa diretamente com a pergunta sobre a idade.
    startFlow: 'warm',
    
    // Multiplicador de atraso de digitação (0.7 = velocidade ideal para alta conversão em tráfego pago)
    typingDelayMultiplier: 0.7,
};

// VARIÁVEIS DE CONTROLE DO ANALYTICS
let localSessionId = null;
const utmParams = {
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    src: '',
    sck: ''
};

// VARIÁVEIS DO USUÁRIO
const userVars = {
    idade: '',
    objetivo: '',
    praticouAntes: '',
    flexibilidade: '',
    fisico: '',
    corpoSonhos: '',
    melhorFisicoTempo: '',
    regiaoFoco: '',
    exercicioFreq: '',
    sonoHoras: '',
    motivoEntrarForma: '',
    altura: '',
    peso: '',
    pesoIdeal: '',
    dataAlvo: '',
    grupo_ab: ''
};

// A conexão com o Supabase agora é feita 100% via servidor para proteger as chaves.


// DISPARADOR DE PIXEL DO META REMOVIDO A PEDIDO

// CAPTURA DE PARÂMETROS UTM (PERSISTENCIA EM SESSION STORAGE)
function parseUtms() {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck'];
    
    keys.forEach(key => {
        if (params.has(key)) {
            const val = params.get(key);
            sessionStorage.setItem(key, val);
            utmParams[key] = val;
        } else {
            const savedVal = sessionStorage.getItem(key);
            if (savedVal) {
                utmParams[key] = savedVal;
            }
        }
    });
}

// GERA O LINK DE CHECKOUT DILUÍDO COM UTMS DO SESSION STORAGE
function getCheckoutUrlWithParams() {
    try {
        const url = new URL(CONFIG.checkoutUrl);
        for (const key in utmParams) {
            const savedVal = sessionStorage.getItem(key);
            if (savedVal) {
                url.searchParams.set(key, savedVal);
            }
        }
        return url.toString();
    } catch (e) {
        console.error("Erro ao formatar URL de checkout:", e);
        return CONFIG.checkoutUrl;
    }
}

// FORMATADORES AUXILIARES
function getTargetDateStr() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 36); // Previsão de 36 dias para emagrecimento
    const options = { day: 'numeric', month: 'long' };
    return targetDate.toLocaleDateString('pt-BR', options);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

// FORMATADOR DE TEXTO (Suporta Negrito **, Itálico * e Sublinhado __)
function formatMessageText(text) {
    if (!text) return "";
    
    // Substitui variáveis com escape para evitar XSS
    let formatted = text
        .replace(/{objetivo}/g, escapeHtml(userVars.objetivo))
        .replace(/{pesoIdeal}/g, escapeHtml(userVars.pesoIdeal))
        .replace(/{dataAlvo}/g, escapeHtml(userVars.dataAlvo));

    // Parse Markdown simples
    formatted = formatted
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/\n/g, '<br>');

    return formatted;
}

// DEFINIÇÃO DO FLUXO DE CONVERSAÇÃO
const chatFlow = {
    // --- FLUXO INICIAL WARM ---
    start_warm: {
        botMessages: [
            { type: 'text', content: 'Oie, tudo bem? 👋' },
            { type: 'text', content: 'Meu nome é Beatriz Araujo e sou especialista em **Pilates de Parede há mais de 6 anos... **' },
            { type: 'text', content: 'Gostaria de receber **GRATUITAMENTE** um plano personalizado de Pilates na Parede que** fortalece seu corpo, aumenta sua autoestima e te deixa em forma em apenas 28 dias? **(CLIQUE NO BOTÃO ABAIXO)' }
        ],
        input: {
            type: 'choice',
            choices: ['✅ EU QUERO!'],
            next: 'intro_age_warm'
        }
    },

    intro_age_warm: {
        botMessages: [
            { type: 'text', content: 'Perfeito! Qual a sua idade? 🌸' }
        ],
        input: {
            type: 'choice',
            choices: ['18 a 29 anos', '30 a 39 anos', '40 a 49 anos', '50 ou mais'],
            storeVar: 'idade',
            next: 'goal'
        }
    },

    // --- FLUXO INICIAL DIRETO ---
    intro_age_direct: {
        botMessages: [
            { type: 'text', content: '🔥 Quer transformar seu corpo sem precisar de academia? 🔥' },
            { type: 'text', content: 'Se você quer perder peso, ganhar massa magra e melhorar sua autoestima **com treinos em casa**, tenho algo especial para você.' },
            { type: 'text', content: 'Em apenas **15 minutos por dia**, você pode ter resultados visíveis em **28 dias**. ' },
            { type: 'text', content: '👉 Antes de te mostrar como, me conta: **qual a sua idade?**' }
        ],
        input: {
            type: 'choice',
            choices: ['18 a 29 anos', '30 a 39 anos', '40 a 49 anos', '50 ou mais'],
            storeVar: 'idade',
            next: 'goal'
        }
    },

    // --- PERGUNTAS DO FLUXO ---
    goal: {
        botMessages: [
            { type: 'text', content: '**Legal, e qual é seu principal objetivo com o pilates?**' }
        ],
        input: {
            type: 'choice',
            choices: ['Perder barriga', 'Aumentar a força muscular', 'Desenvolver a flexibilidade', 'Reduzir o estresse e ansiedade', 'Reduzir as dores corporais'],
            storeVar: 'objetivo',
            next: 'practiced'
        }
    },

    practiced: {
        botMessages: [
            { type: 'text', content: '**Você já praticou Pilates antes?**' }
        ],
        input: {
            type: 'choice',
            choices: ['Sim, já pratico regularmente', 'Já fiz algumas vezes, mas não com frequência', 'Nunca fiz'],
            storeVar: 'praticouAntes',
            next: 'flexibility'
        }
    },

    flexibility: {
        botMessages: [
            { type: 'text', content: '**Qual é seu nível de flexibilidade? **' },
            { type: 'text', content: '*Não importa seu nível, vamos elaborar um plano totalmente **especial** para você!*' }
        ],
        input: {
            type: 'choice',
            choices: ['Sou flexível', 'Mais ou menos flexível', 'Não sou flexível'],
            storeVar: 'flexibilidade',
            next: 'physique'
        }
    },

    physique: {
        botMessages: [
            { type: 'text', content: '**Como você descreveria seu fisico?**' }
        ],
        input: {
            type: 'choice',
            choices: ['Magra', 'Média', 'Um pouco acima do peso', 'Acima do peso'],
            storeVar: 'fisico',
            next: 'body_goal'
        }
    },

    body_goal: {
        botMessages: [
            { type: 'text', content: '**Qual é o seu "corpo dos sonhos"?**' }
        ],
        input: {
            type: 'choice',
            choices: ['Magra', 'Tonificada', 'Com curvas', 'Média'],
            storeVar: 'corpoSonhos',
            next: 'best_physique_time'
        }
    },

    best_physique_time: {
        botMessages: [
            { type: 'text', content: '**Há quanto tempo você esteve no melhor físico de sua vida?**' }
        ],
        input: {
            type: 'choice',
            choices: ['Há menos de um ano', '1 a 2 anos atrás', 'Há mais de 3 anos', 'Não sei dizer'],
            storeVar: 'melhorFisicoTempo',
            next: 'focus_region'
        }
    },

    focus_region: {
        botMessages: [
            { type: 'text', content: '**Qual região do corpo você gostaria de atingir primeiro?**' }
        ],
        input: {
            type: 'choice',
            choices: ['Barriga', 'Glúteos', 'Pernas', 'Peito'],
            storeVar: 'regiaoFoco',
            next: 'exercise_frequency'
        }
    },

    exercise_frequency: {
        botMessages: [
            { type: 'text', content: '**Quantas vezes faz exercício?**' }
        ],
        input: {
            type: 'choice',
            choices: ['Quase todos os dias', 'Algumas vezes na semana', 'Algumas vezes por mês', 'Poucas vezes'],
            storeVar: 'exercicioFreq',
            next: 'sleep'
        }
    },

    sleep: {
        botMessages: [
            { type: 'text', content: '**Já estou terminando, só me responde mais algumas perguntinhas por favor **' },
            { type: 'text', content: '**Quantas horas você dorme por dia?**' }
        ],
        input: {
            type: 'choice',
            choices: ['Menos de 5 horas', '5-6 horas', '7-8 horas', 'Mais de 8 horas'],
            storeVar: 'sonoHoras',
            next: 'motivation'
        }
    },

    motivation: {
        botMessages: [
            { type: 'text', content: '**Qual é o seu principal motivo para entrar em forma?**' }
        ],
        input: {
            type: 'choice',
            choices: ['Me sentir mais confiante no meu corpo', 'Me sentir mais saudável e com energia', 'Vestir melhor minhas roupas', 'Voltar a forma após o parto', 'Outros'],
            storeVar: 'motivoEntrarForma',
            next: 'height_input'
        }
    },

    height_input: {
        botMessages: [
            { type: 'text', content: '**Qual a sua altura em cm?**' }
        ],
        input: {
            type: 'number',
            min: 100,
            max: 250,
            placeholder: 'Ex: 165',
            storeVar: 'altura',
            next: 'weight_input'
        }
    },

    weight_input: {
        botMessages: [
            { type: 'text', content: '**Qual é o seu peso atualmente em kgs?**' }
        ],
        input: {
            type: 'number',
            min: 30,
            max: 300,
            placeholder: 'Ex: 60',
            storeVar: 'peso',
            next: 'target_weight_input'
        }
    },

    target_weight_input: {
        botMessages: [
            { type: 'text', content: '**Entendi! E qual é o seu objetivo de peso ideal em kgs?**' }
        ],
        input: {
            type: 'number',
            min: 30,
            max: 300,
            placeholder: 'Ex: 60',
            storeVar: 'pesoIdeal',
            next: 'ready_offer'
        }
    },

    // --- FASE DE OFERTAS ---
    ready_offer: {
        botMessages: [
            { type: 'text', content: '**Seu Plano de Pilates de Parede para {objetivo} está pronto! **' },
            { type: 'text', content: 'De acordo com as informações que você me passou' },
            { type: 'text', content: 'Prevemos que você estará com **{pesoIdeal}** kg até {dataAlvo}' },
            { type: 'image', content: 'grafico.png' },
            { type: 'text', content: 'Você está preparada para essa transformação?' }
        ],
        input: {
            type: 'choice',
            choices: ['SIM, ESTOU PREPARADA!'],
            next: 'benefits_offer'
        }
    },

    benefits_offer: {
        botMessages: [
            { type: 'text', content: 'Deixa eu te explicar como irá funcionar...' },
            { type: 'text', content: 'Você receberá **treinos personalizados **exclusivamente para você, **todos os dias!** Exercícios que você pode fazer em casa' },
            { type: 'text', content: '**✅ Perda de peso**\n**✅ Ganho de massa magra**\n**✅ Alivio de dores nas costas**\n**✅ Melhora da postura**\n**✅ Aumento da autoestima**\n**✅ Aumento da libido**\n**✅ Melhora da flexibilidade**\n**✅ Pode ser feito em casa**\n**✅ Sem aparelhos, você não precisa comprar NADA.**' },
            { type: 'text', content: '**Você está preparada para essa transformação na sua vida?**' }
        ],
        input: {
            type: 'choice',
            choices: ['SIM, EU ACEITO O DESAFIO!'],
            next: 'pricing_offer'
        }
    },

    pricing_offer: {
        botMessages: [
            { type: 'text', content: 'Não gostamos de ver que uma mensalidade em academias pelo Brasil pode chegar a R$ 200,00 por mês! Fora nutricionistas e personais! Achamos um absurdo isso...' },
            { type: 'text', content: 'Por isso queremos oferecer isso a você sem nenhum custo. Sim, é isso mesmo, o **acompanhamento é totalmente gratuito.**' },
            { type: 'text', content: 'Mas, para manter tudo rodando e garantir que você tenha a melhor experiência, cobramos uma pequena** taxa de inscrição de APENAS R$ 29,90.** __Que é o valor que a Plataforma nos cobra para hospedar as aulas dos treinos.__' },
            { type: 'text', content: 'Essa pequena contribuição nos ajuda a manter tudo isso vivo, a continuar apoiando e transformando a vida de tantas mulheres. E é também uma forma de selarmos nosso compromisso juntos. ' },
            { type: 'text', content: 'Além disso, se em até **30 dias** você sentir que não está vendo a mudança que esperava, eu prometo que devolvo cada centavo.' },
            { type: 'text', content: 'Assim que finalizar o pagamento, vou liberar um bônus extra para você por estar comigo até agora... ' }
        ],
        input: {
            type: 'choice',
            choices: ['QUERO COMEÇAR A MINHA TRANSFORMAÇÃO!'],
            next: 'redirect'
        }
    }
};

// SELETORES DO DOM
const chatBody = document.getElementById('chat-body');
const messagesContainer = document.getElementById('messages-container');
const typingIndicator = document.getElementById('typing-indicator');
const inputContainer = document.getElementById('input-container');

let currentState = null;

// FILA LOCAL DE EVENTOS COM SINCRONIZAÇÃO VIA /api/events
// FILA DE SINCRONIZAÇÃO OFFLINE CLIENT-SIDE (FIRE-AND-FORGET)
let isSyncingEvents = false;
const MAX_QUEUE_SIZE = 100; // Limite máximo para evitar sobrecarregar o localStorage

async function syncEventsQueue() {
    if (isSyncingEvents) return;
    
    let queue = [];
    try {
        const raw = localStorage.getItem('pilates_events_queue');
        if (raw) queue = JSON.parse(raw);
    } catch (e) {
        return;
    }
    
    // Filtro de expiração (expira em 24h)
    const maxAge = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const activeEvents = queue.filter(e => (now - new Date(e.created_at).getTime()) < maxAge);
    
    // Limita o tamanho máximo da fila descartando os mais antigos (Regra 15)
    if (activeEvents.length > MAX_QUEUE_SIZE) {
        activeEvents.splice(0, activeEvents.length - MAX_QUEUE_SIZE);
    }
    
    if (activeEvents.length !== queue.length) {
        try {
            localStorage.setItem('pilates_events_queue', JSON.stringify(activeEvents));
        } catch (e) {}
    }
    
    if (activeEvents.length === 0) return;
    isSyncingEvents = true;
    
    // Regra 1: Envia no máximo 50 eventos por requisição
    const eventsToSync = activeEvents.slice(0, 50);
    
    try {
        const res = await fetch('/api/events', {
            method: 'POST',
            keepalive: true,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventsToSync)
        });
        
        if (res.ok) {
            const data = await res.json();
            
            // Regra 15: Separa syncedIds e rejectedIds para remoção segura
            if (data && (data.syncedIds || data.rejectedIds)) {
                let currentQueue = [];
                try {
                    const raw = localStorage.getItem('pilates_events_queue');
                    if (raw) currentQueue = JSON.parse(raw);
                } catch (e) {}
                
                const removeIds = [...(data.syncedIds || []), ...(data.rejectedIds || [])];
                const remainingQueue = currentQueue.filter(e => !removeIds.includes(e.client_event_id));
                localStorage.setItem('pilates_events_queue', JSON.stringify(remainingQueue));
            }
        }
    } catch (err) {
        console.warn("Conexão indisponível para sincronizar eventos com o servidor.");
    } finally {
        isSyncingEvents = false;
    }
}

async function writeSupabaseEvent(stepKey, answerValue = '', eventType = 'etapa_vista') {
    try {
        // Regra 6: Adiciona o client_event_id único no momento da entrada na fila
        const clientEventId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
            ? crypto.randomUUID() 
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
              });

        const eventObj = {
            client_event_id: clientEventId,
            session_id: localSessionId,
            quiz_id: 'pilates_beatriz',
            step_key: stepKey,
            answer_value: answerValue ? answerValue.toString() : '',
            event_type: eventType,
            grupo_ab: userVars.grupo_ab || 'A',
            utm_source: utmParams.utm_source || '',
            utm_medium: utmParams.utm_medium || '',
            utm_campaign: utmParams.utm_campaign || '',
            utm_content: utmParams.utm_content || '',
            utm_term: utmParams.utm_term || '',
            src: utmParams.src || '',
            sck: utmParams.sck || '',
            created_at: new Date().toISOString()
        };

        let queue = [];
        try {
            const raw = localStorage.getItem('pilates_events_queue');
            if (raw) queue = JSON.parse(raw);
        } catch (e) {}

        queue.push(eventObj);
        
        // Garante limite máximo
        if (queue.length > MAX_QUEUE_SIZE) {
            queue.splice(0, queue.length - MAX_QUEUE_SIZE);
        }
        
        localStorage.setItem('pilates_events_queue', JSON.stringify(queue));
        
        // Sincroniza em background
        syncEventsQueue();
    } catch (e) {}
}

async function trackSessionStart(grupoAb) {
    parseUtms();
    let savedId = sessionStorage.getItem('quiz_session_id');
    if (!savedId) {
        savedId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('quiz_session_id', savedId);
    }
    localSessionId = savedId;
    writeSupabaseEvent('start', grupoAb, 'visita');
}

async function trackStepReached(stepKey) {
    if (!localSessionId) return;
    writeSupabaseEvent(stepKey, '', 'etapa_vista');
}

async function trackAnswer(stepKey, storeVar, value) {
    if (!localSessionId) return;
    writeSupabaseEvent('answer_' + (storeVar || 'choice'), value, 'resposta');
}

async function trackEvent(eventType, eventValue = '', eventTypeCat = 'marco') {
    if (!localSessionId) return;
    writeSupabaseEvent(eventType, eventValue, eventTypeCat);
}

// INICIAR O CHAT
async function initChat() {
    parseUtms();
    
    const savedState = sessionStorage.getItem('quiz_current_state');
    const savedVars = sessionStorage.getItem('quiz_user_vars');
    
    if (savedState && savedVars) {
        try {
            const parsedVars = JSON.parse(savedVars);
            Object.assign(userVars, parsedVars);
            currentState = savedState;
            
            // Se estava no estado final de redirecionamento, reseta para a oferta anterior
            if (currentState === 'redirect') {
                currentState = 'pricing_offer';
            }
        } catch (e) {
            sessionStorage.removeItem('quiz_current_state');
            sessionStorage.removeItem('quiz_user_vars');
        }
    }
    
    if (!currentState) {
        const splitGroup = Math.random() < 0.5 ? 'A' : 'B';
        userVars.grupo_ab = splitGroup;
        currentState = splitGroup === 'A' ? 'intro_age_direct' : 'start_warm';
        sessionStorage.setItem('quiz_current_state', currentState);
        sessionStorage.setItem('quiz_user_vars', JSON.stringify(userVars));
    }
    
    userVars.dataAlvo = getTargetDateStr();
    
    // Inicia rastreamento da sessão (com tipo 'visita')
    if (!sessionStorage.getItem('quiz_session_id')) {
        trackSessionStart(userVars.grupo_ab);
    } else {
        localSessionId = sessionStorage.getItem('quiz_session_id');
    }
    
    localStorage.removeItem('chatHistory');
    
    runState(currentState);

    // Sincroniza fila pendente ao iniciar e depois a cada 10 segundos
    syncEventsQueue();
    setInterval(() => {
        if (!document.hidden) syncEventsQueue();
    }, 10000);
}

// EXECUTAR UM ESTADO DO CHAT
async function runState(stateKey) {
    if (stateKey === 'redirect') {
        const checkoutUrl = getCheckoutUrlWithParams();
        // Dispara Pixel de Initiate Checkout

        trackEvent('checkout_click', checkoutUrl, 'clique_checkout');
        
        // Limpa estado para que novos acessos comecem do zero
        sessionStorage.removeItem('quiz_current_state');
        sessionStorage.removeItem('quiz_user_vars');
        
        // Regra 15: Tenta sincronizar a fila local antes do redirecionamento (max 1.5s)
        Promise.race([
            syncEventsQueue(),
            new Promise(resolve => setTimeout(resolve, 1500))
        ]).finally(() => {
            window.location.href = checkoutUrl;
        });
        return;
    }

    const state = chatFlow[stateKey];
    if (!state) return;

    currentState = stateKey;
    sessionStorage.setItem('quiz_current_state', stateKey);
    sessionStorage.setItem('quiz_user_vars', JSON.stringify(userVars));

    // Desativa inputs enquanto digita
    inputContainer.innerHTML = '';

    // Envia eventos para indicar que alcançou o estágio atual
    trackStepReached(stateKey);

    // Marcos de Pixel do Meta baseados no estado atual
    if (stateKey === 'sleep') {

        trackEvent('Quiz50Percent', '', 'marco');
    } else if (stateKey === 'ready_offer') {

        trackEvent('QuizPitch', '', 'marco');
    }

    // Envia mensagens do bot sequencialmente
    for (const msg of state.botMessages) {
        await showTyping(msg);
        addBotMessage(msg);
    }

    // Renderiza o input correspondente
    if (state.input) {
        renderInput(state.input, stateKey);
    }
}

// SIMULAR DIGITAÇÃO DO BOT
function showTyping(message) {
    return new Promise(resolve => {
        typingIndicator.classList.remove('hidden');
        scrollChat();

        // Calcula delay de digitação proporcional ao tamanho da mensagem
        let textLen = message.type === 'text' ? message.content.length : 40;
        let baseDelay = Math.max(800, Math.min(2200, textLen * 18));
        let delay = baseDelay * CONFIG.typingDelayMultiplier;

        setTimeout(() => {
            typingIndicator.classList.add('hidden');
            resolve();
        }, delay);
    });
}

// ADICIONAR BALÃO DO BOT
function addBotMessage(message) {
    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = 'chat-bubble-container bot-message-container';

    // Avatar
    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'avatar-wrapper';
    avatarWrapper.innerHTML = `<img src="avatar.jpg" class="chat-avatar" alt="Avatar">`;
    bubbleContainer.appendChild(avatarWrapper);

    // Conteúdo da bolha (modificado para não renderizar imagens dentro da bolha branca)
    if (message.type === 'text') {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble bot-bubble';
        bubble.innerHTML = formatMessageText(message.content);
        bubbleContainer.appendChild(bubble);
    } else if (message.type === 'image') {
        const imgEl = document.createElement('img');
        imgEl.className = 'bubble-image-standalone';
        imgEl.src = message.content;
        imgEl.alt = 'Imagem do Plano';
        bubbleContainer.appendChild(imgEl);
    }

    messagesContainer.appendChild(bubbleContainer);
    scrollChat();
}

// ADICIONAR BALÃO DO USUÁRIO
function addUserMessage(text) {
    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = 'chat-bubble-container user-message-container';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user-bubble';
    bubble.textContent = text;

    bubbleContainer.appendChild(bubble);
    messagesContainer.appendChild(bubbleContainer);
    scrollChat();
}

// ROLAR O CHAT PARA O FINAL
function scrollChat() {
    setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 50);
}

// RENDERIZAR OPÇÕES DE ENTRADA DO USUÁRIO
function renderInput(inputConfig, stateKey) {
    inputContainer.innerHTML = '';

    if (inputConfig.type === 'choice') {
        inputConfig.choices.forEach(choiceText => {
            const btn = document.createElement('button');
            btn.className = 'choice-button';
            if (inputConfig.next === 'redirect') {
                btn.id = 'ic';
            }
            btn.textContent = choiceText;
            btn.addEventListener('click', () => handleChoiceSelect(choiceText, inputConfig, stateKey));
            inputContainer.appendChild(btn);
        });
    } else if (inputConfig.type === 'number') {
        const form = document.createElement('form');
        form.className = 'input-form';
        form.autocomplete = 'off';

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'form-input';
        input.placeholder = inputConfig.placeholder || '';
        input.min = inputConfig.min;
        input.max = inputConfig.max;
        input.required = true;

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'form-submit-btn';
        submitBtn.textContent = 'Enviar';

        form.appendChild(input);
        form.appendChild(submitBtn);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = input.value.trim();
            if (val) {
                handleNumberSubmit(val, inputConfig, stateKey);
            }
        });

        inputContainer.appendChild(form);
        input.focus();
    }
}

// PROCESSAR CLIQUE DE OPÇÃO DO USUÁRIO
function handleChoiceSelect(choiceText, inputConfig, stateKey) {
    inputContainer.style.display = 'none';
    setTimeout(() => {
        inputContainer.innerHTML = '';
        inputContainer.style.display = 'flex';
    }, 100);
    
    addUserMessage(choiceText);
    
    // Dispara Pixel do Meta de início na primeira interação (pergunta de idade)
    if (stateKey === 'intro_age_direct' || stateKey === 'intro_age_warm') {

    }
    
    // Salva a resposta na variável correspondente, se houver
    if (inputConfig.storeVar) {
        userVars[inputConfig.storeVar] = choiceText;
    }

    // Rastreia a resposta
    trackAnswer(stateKey, inputConfig.storeVar || 'choice', choiceText);

    // Avança para o próximo estado
    currentState = inputConfig.next;
    setTimeout(() => {
        runState(currentState);
    }, 300);
    saveChatHistory();
}

// PROCESSAR SUBMISSÃO DE VALOR NUMÉRICO DO USUÁRIO
function handleNumberSubmit(value, inputConfig, stateKey) {
    inputContainer.style.display = 'none';
    setTimeout(() => {
        inputContainer.innerHTML = '';
        inputContainer.style.display = 'flex';
    }, 100);
    
    addUserMessage(value);

    // Salva a resposta na variável correspondente
    if (inputConfig.storeVar) {
        userVars[inputConfig.storeVar] = value;
    }

    // Rastreia a resposta
    trackAnswer(stateKey, inputConfig.storeVar, value);

    // Avança para o próximo estado
    currentState = inputConfig.next;
    setTimeout(() => {
        runState(currentState);
    }, 300);
    saveChatHistory();
}

function saveChatHistory() {
    localStorage.setItem('chatHistory', document.getElementById('messages-container').innerHTML);
}

// Inicializa o chat ao carregar a página
window.addEventListener('DOMContentLoaded', initChat);

// Sincroniza a fila automaticamente assim que a conexão de internet for restabelecida
window.addEventListener('online', syncEventsQueue);

// Bloquear clique com botão direito do mouse
document.addEventListener('contextmenu', event => event.preventDefault());

// Bloquear atalhos de cópia (Ctrl+C, Ctrl+U, Ctrl+S, F12, Ctrl+Shift+I)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
    }
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
        e.preventDefault();
    }
});
