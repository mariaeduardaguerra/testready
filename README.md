# TestReady

Aplicação web para verificar câmera, microfone e acesso ao serviço
antes de provas, reuniões, entrevistas ou aulas online.

Projeto educacional de Redes de Computadores e Computação em Nuvem,
inspirado na minha experiência com suporte técnico a provas online.

## Funcionalidades

- Solicitação de acesso à câmera e exibição da imagem.
- Solicitação de acesso ao microfone e indicador de entrada de áudio.
- Encerramento manual da captura dos dispositivos.
- Verificação do serviço com três requisições HTTP.
- Exibição do tempo médio de resposta observado.
- Checklist de preparação.
- Geração e cópia de um resumo dos resultados.

## Tecnologias

- HTML e CSS.
- JavaScript.
- Node.js, sem dependências externas.
- API MediaDevices.
- Web Audio API.
- Fetch API.

## Como executar

É necessário ter Node.js instalado.

Na pasta do projeto, execute:

```bash
npm start
```

Abra no navegador:

```text
http://localhost:3000
```

Mantenha o terminal aberto durante o uso.
Para encerrar o servidor, pressione Ctrl + C.

Não utilize Live Server nesta versão: o teste de conexão depende
do endpoint disponibilizado pelo servidor Node.js.

## Organização dos arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Interface e estilos da aplicação. |
| `app.js` | Captura dos dispositivos, testes e resumo. |
| `server.js` | Servidor HTTP, arquivos da página e endpoint de verificação. |
| `package.json` | Configuração e comando de inicialização. |

## Arquitetura local

O navegador solicita a página e o JavaScript ao servidor Node.js.

Câmera e microfone são acessados diretamente pelo navegador,
mediante autorização do usuário.

Para verificar o serviço, a aplicação envia três requisições
GET ao endpoint `/api/health`, que retorna uma resposta JSON.

## Conceitos de redes demonstrados

### HTTP

A página e o serviço usam o modelo de requisição e resposta.
O servidor responde com códigos como 200, 404 e 405.

### Tempo de resposta

A aplicação mede o tempo entre o início da requisição e a leitura
da resposta JSON, calculando a média de três amostras.

Essa medida inclui processamento do navegador e do servidor.
Não representa uma medição isolada de latência da rede.

### Localhost

Nesta versão, o servidor escuta em 127.0.0.1, porta 3000.
Ele fica acessível apenas no próprio computador.

O teste em localhost não verifica a conexão com um serviço remoto
nem comprova acesso à internet.

### Contexto seguro e HTTPS

O navegador exige um contexto seguro para acesso aos dispositivos.
Localhost permite o desenvolvimento local; uma publicação remota
deve utilizar HTTPS.

### DNS e publicação em nuvem

Uma futura versão pública utilizará um nome de domínio para
localizar o serviço hospedado.

A configuração de hospedagem, domínio e HTTPS ainda está pendente.

## Privacidade

- A aplicação não grava áudio ou vídeo.
- O código não envia áudio ou vídeo ao servidor.
- O microfone é analisado localmente para movimentar o indicador.
- O usuário pode encerrar o acesso aos dispositivos pelos botões.
- Resultados e checklist ficam apenas na memória da página.
- Recarregar a página remove os resultados desta versão.

## Limitações

- Não mede velocidade de download ou upload.
- Não garante estabilidade futura da conexão.
- Não valida requisitos específicos de instituições.
- Detectar áudio não comprova qualidade de voz: ruídos também
  podem movimentar o indicador.
- A qualidade da imagem precisa ser conferida visualmente.
- O resumo representa o momento em que foi gerado.
- Não fornece aprovação oficial para provas ou plataformas.

## Verificação manual

Cenários propostos para execução:

- Permitir acesso à câmera e conferir a prévia.
- Encerrar a câmera.
- Negar uma permissão e conferir a mensagem.
- Permitir acesso ao microfone e observar o indicador.
- Encerrar o microfone.
- Executar a verificação do serviço.
- Marcar itens do checklist e gerar o resumo.
- Copiar o resumo.
- Conferir a interface em uma tela pequena.

A execução desses cenários ainda deve ser documentada.
Não há suíte de testes automatizados nesta versão.

## Situação do projeto

- Interface e servidor Node.js implementados.
- Publicado no Render com HTTPS.
- Verificação online concluída com três requisições bem-sucedidas.
- Avaliação completa de câmera, microfone e interface ainda
  deve ser documentada.

## Demonstração online

[Acessar TestReady](https://testready.onrender.com)

Hospedado no Render com HTTPS.
O plano gratuito pode apresentar espera na primeira abertura
após um período sem acessos.
