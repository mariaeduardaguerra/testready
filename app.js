const buscar = (seletor) => document.querySelector(seletor);

let camera = null;
let microfone = null;
let contextoAudio = null;
let animacaoAudio = null;

let versaoCamera = 0;
let versaoMicrofone = 0;

const resultados = {
  camera: "Não testada",
  microfone: "Não testado",
  conexao: "Não verificada"
};

buscar("#contexto").textContent = window.isSecureContext
  ? "Contexto seguro disponível para solicitar câmera e microfone."
  : "Abra pelo localhost ou por HTTPS para utilizar câmera e microfone.";

function erroDispositivo(erro) {
  switch (erro.name) {
    case "NotAllowedError":
      return "Acesso negado ou bloqueado. Confira as permissões do navegador.";

    case "NotFoundError":
      return "Nenhum dispositivo compatível foi encontrado.";

    case "NotReadableError":
      return "Não foi possível acessar o dispositivo. Ele pode estar em uso.";

    case "SecurityError":
      return "O acesso foi bloqueado por uma configuração de segurança.";

    default:
      return "Não foi possível iniciar o teste: " + erro.message;
  }
}

function encerrarFaixas(stream) {
  stream?.getTracks().forEach((faixa) => {
    faixa.stop();
  });
}

function verificarSuporte() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      "Captura indisponível. Use um navegador compatível em localhost ou HTTPS."
    );
  }
}

// Câmera
function pararCamera(atualizarStatus = true) {
  versaoCamera++;

  encerrarFaixas(camera);
  camera = null;

  buscar("#video").srcObject = null;
  buscar("#iniciarCamera").disabled = false;

  if (atualizarStatus) {
    buscar("#statusCamera").textContent =
      "Câmera encerrada. O último resultado foi mantido.";
  }
}

async function iniciarCamera() {
  pararCamera(false);

  const versao = versaoCamera;

  buscar("#iniciarCamera").disabled = true;
  buscar("#statusCamera").textContent =
    "Aguardando sua autorização...";

  resultados.camera = "Teste em andamento";

  let stream = null;

  try {
    verificarSuporte();

    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    // Se o teste foi cancelado enquanto a permissão estava aberta.
    if (versao !== versaoCamera) {
      encerrarFaixas(stream);
      return;
    }

    camera = stream;
    buscar("#video").srcObject = stream;

    await buscar("#video").play();

    if (versao !== versaoCamera) {
      encerrarFaixas(stream);
      return;
    }

    resultados.camera =
      "Captura iniciada. A qualidade da imagem exige conferência visual.";

    buscar("#statusCamera").textContent = resultados.camera;
  } catch (erro) {
    encerrarFaixas(stream);

    if (versao !== versaoCamera) return;

    camera = null;
    buscar("#video").srcObject = null;

    resultados.camera = erroDispositivo(erro);
    buscar("#statusCamera").textContent = resultados.camera;
  } finally {
    if (versao === versaoCamera) {
      buscar("#iniciarCamera").disabled = false;
    }
  }
}

// Microfone
function pararMicrofone(atualizarStatus = true) {
  versaoMicrofone++;

  cancelAnimationFrame(animacaoAudio);
  animacaoAudio = null;

  encerrarFaixas(microfone);
  microfone = null;

  if (contextoAudio) {
    contextoAudio.close().catch(() => {});
    contextoAudio = null;
  }

  buscar("#nivelAudio").value = 0;
  buscar("#iniciarMicrofone").disabled = false;

  if (atualizarStatus) {
    buscar("#statusMicrofone").textContent =
      "Microfone encerrado. O último resultado foi mantido.";
  }
}

async function iniciarMicrofone() {
  pararMicrofone(false);

  const versao = versaoMicrofone;

  buscar("#iniciarMicrofone").disabled = true;
  buscar("#statusMicrofone").textContent =
    "Aguardando sua autorização...";

  resultados.microfone = "Teste em andamento";

  let stream = null;

  try {
    verificarSuporte();

    const AudioContextDisponivel =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextDisponivel) {
      throw new Error("A análise de áudio não é suportada neste navegador.");
    }

    const audio = new AudioContextDisponivel();
    contextoAudio = audio;

    // Iniciado pelo clique do usuário.
    await audio.resume();

    if (versao !== versaoMicrofone) return;

    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });

    if (versao !== versaoMicrofone) {
      encerrarFaixas(stream);
      return;
    }

    microfone = stream;

    const origem = audio.createMediaStreamSource(stream);
    const analisador = audio.createAnalyser();

    analisador.fftSize = 2048;
    origem.connect(analisador);

    // Não conectamos ao alto-falante, evitando retorno de áudio.
    const amostras = new Uint8Array(analisador.fftSize);
    let sinalDetectado = false;

    resultados.microfone = "Captura iniciada; sinal ainda não detectado.";

    buscar("#statusMicrofone").textContent =
      "Microfone aberto. Fale para observar o indicador.";

    function atualizarNivel() {
      if (versao !== versaoMicrofone) return;

      analisador.getByteTimeDomainData(amostras);

      let soma = 0;

      for (const amostra of amostras) {
        const normalizada = (amostra - 128) / 128;
        soma += normalizada * normalizada;
      }

      const intensidade = Math.sqrt(soma / amostras.length);

      buscar("#nivelAudio").value =
        Math.min(100, intensidade * 400);

      if (intensidade > 0.02 && !sinalDetectado) {
        sinalDetectado = true;

        resultados.microfone =
          "Sinal de áudio detectado; pode incluir ruído ambiente.";

        buscar("#statusMicrofone").textContent =
          resultados.microfone;
      }

      animacaoAudio = requestAnimationFrame(atualizarNivel);
    }

    atualizarNivel();
  } catch (erro) {
    encerrarFaixas(stream);

    if (versao !== versaoMicrofone) return;

    pararMicrofone(false);

    resultados.microfone = erroDispositivo(erro);
    buscar("#statusMicrofone").textContent =
      resultados.microfone;
  } finally {
    if (versao === versaoMicrofone) {
      buscar("#iniciarMicrofone").disabled = false;
    }
  }
}

// Serviço HTTP
async function testarConexao() {
  const botao = buscar("#testarConexao");

  botao.disabled = true;
  buscar("#statusConexao").textContent =
    "Verificando três requisições...";

  resultados.conexao = "Teste em andamento";

  try {
    const tempos = [];

    for (let tentativa = 0; tentativa < 3; tentativa++) {
      const inicio = performance.now();

      const resposta = await fetch(
        `/api/health?tentativa=${tentativa}&t=${Date.now()}`,
        {
          cache: "no-store",
          signal: AbortSignal.timeout(8000)
        }
      );

      if (!resposta.ok) {
        throw new Error(`O serviço respondeu HTTP ${resposta.status}.`);
      }

      const dados = await resposta.json();

      if (dados.servico !== "TestReady" || dados.status !== "ok") {
        throw new Error("A resposta não corresponde ao serviço esperado.");
      }

      tempos.push(performance.now() - inicio);
    }

    const media = tempos.reduce((total, tempo) => {
      return total + tempo;
    }, 0) / tempos.length;

    resultados.conexao =
      `3 de 3 requisições concluídas. ` +
      `Média observada: ${media.toFixed(1)} ms.`;

    buscar("#statusConexao").textContent =
      resultados.conexao;
  } catch (erro) {
    resultados.conexao =
      "Não foi possível concluir a verificação: " +
      (erro.name === "TimeoutError"
        ? "tempo limite excedido."
        : erro.message);

    buscar("#statusConexao").textContent =
      resultados.conexao;
  } finally {
    botao.disabled = false;
  }
}

// Resumo
function gerarResumo() {
  const itens = [
    ...document.querySelectorAll(".checklist input")
  ];

  const marcados = itens.filter((item) => item.checked).length;

  buscar("#resumo").value = [
    "TestReady — RESUMO DA VERIFICAÇÃO",
    "",
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    `Endereço: ${location.origin}`,
    `Contexto seguro: ${window.isSecureContext ? "Sim" : "Não"}`,
    "",
    `Câmera: ${resultados.camera}`,
    `Microfone: ${resultados.microfone}`,
    `Serviço: ${resultados.conexao}`,
    "",
    `Checklist: ${marcados} de ${itens.length} itens marcados.`,
    ...itens.map((item) => {
      const descricao = item.parentElement.textContent
        .trim()
        .replace(/\s+/g, " ");

      return `${item.checked ? "[x]" : "[ ]"} ${descricao}`;
    }),
    "",
    "Resultados referentes ao momento da verificação.",
    "O teste HTTP não mede a velocidade da internet.",
    "Não representa aprovação oficial para nenhuma plataforma.",
    "Nenhum áudio ou vídeo foi gravado ou enviado pelo aplicativo."
  ].join("\n");

  buscar("#statusCopia").textContent =
    "Resumo gerado. Gere novamente se alterar os testes ou o checklist.";
}

async function copiarResumo() {
  if (!buscar("#resumo").value) {
    gerarResumo();
  }

  try {
    await navigator.clipboard.writeText(
      buscar("#resumo").value
    );

    buscar("#statusCopia").textContent = "Resumo copiado.";
  } catch {
    buscar("#resumo").focus();
    buscar("#resumo").select();

    buscar("#statusCopia").textContent =
      "Cópia automática indisponível. Pressione Ctrl + C " +
      "ou ⌘ + C para copiar o texto selecionado.";
  }
}

buscar("#iniciarCamera").onclick = iniciarCamera;

buscar("#pararCamera").onclick = () => {
  if (resultados.camera === "Teste em andamento") {
    resultados.camera = "Teste cancelado antes da conclusão.";
  }

  pararCamera();
};

buscar("#iniciarMicrofone").onclick = iniciarMicrofone;

buscar("#pararMicrofone").onclick = () => {
  if (resultados.microfone === "Teste em andamento") {
    resultados.microfone = "Teste cancelado antes da conclusão.";
  }

  pararMicrofone();
};

buscar("#testarConexao").onclick = testarConexao;
buscar("#gerarResumo").onclick = gerarResumo;
buscar("#copiarResumo").onclick = copiarResumo;

// Libera os dispositivos ao sair da página.
window.addEventListener("pagehide", () => {
  pararCamera(false);
  pararMicrofone(false);
});