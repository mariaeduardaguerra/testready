import http from "node:http";
import { readFile } from "node:fs/promises";

const PORTA = Number(process.env.PORT) || 3000;
const HOST = process.env.RENDER ? "0.0.0.0" : "127.0.0.1";

const arquivos = {
  "/": {
    caminho: new URL("./index.html", import.meta.url),
    tipo: "text/html; charset=utf-8"
  },

  "/app.js": {
    caminho: new URL("./app.js", import.meta.url),
    tipo: "text/javascript; charset=utf-8"
  }
};

const servidor = http.createServer(async (requisicao, resposta) => {
  try {
    const url = new URL(requisicao.url, "http://localhost");

    resposta.setHeader("Cache-Control", "no-store");
    resposta.setHeader("X-Content-Type-Options", "nosniff");

    if (requisicao.method !== "GET") {
      resposta.writeHead(405, {
        Allow: "GET",
        "Content-Type": "text/plain; charset=utf-8"
      });

      resposta.end("Método não permitido.");
      return;
    }

    if (url.pathname === "/api/health") {
      resposta.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
      });

      resposta.end(JSON.stringify({
        servico: "TestReady",
        status: "ok",
        horario: new Date().toISOString()
      }));

      return;
    }

    const arquivo = arquivos[url.pathname];

    if (!arquivo) {
      resposta.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8"
      });

      resposta.end("Página não encontrada.");
      return;
    }

    const conteudo = await readFile(arquivo.caminho);

    resposta.writeHead(200, {
      "Content-Type": arquivo.tipo
    });

    resposta.end(conteudo);
  } catch (erro) {
    console.error("Erro ao atender requisição:", erro.message);

    resposta.writeHead(500, {
      "Content-Type": "text/plain; charset=utf-8"
    });

    resposta.end("Não foi possível atender à requisição.");
  }
});

// Disponível apenas no próprio computador durante o desenvolvimento.
servidor.listen(PORTA, HOST, () => {
  console.log(`TestReady iniciado na porta ${PORTA}`);
});