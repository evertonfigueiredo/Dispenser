# 💊 Dispenser Inteligente de Medicamentos: Autonomia e Segurança para Idosos com Apoio de IoT

Este projeto propõe o desenvolvimento de um **dispenser inteligente de medicamentos**, visando garantir maior autonomia e segurança para idosos e pessoas com múltiplas comorbidades. A solução combina **tecnologia embarcada (ESP32)** com um **aplicativo móvel**, além de comunicação em **tempo real via WebSocket** entre os dispositivos.

---

## 🚀 Funcionalidades

- ✅ Dispenser físico com compartimentos automáticos
- ✅ Controle remoto de horários e medicamentos via app
- ✅ Alertas sonoros e visuais para o usuário
- ✅ Comunicação com ESP via Wi-Fi
- ✅ Interface web com atualização **em tempo real** usando WebSocket
- ✅ Integração total com tecnologias embarcadas e frontend responsivo

---

## ⚙️ Tecnologias Utilizadas

- **Frontend:** Next.js + React + TypeScript + Tailwind + shadcn/ui
- **Backend:** Node.js + Express + WebSocket
- **Dispositivo:** ESP32 com comunicação HTTP e JSON

---

## 📦 Instalação

### 1. Backend

```bash
cd back
npm install
node server.js
````

### 2. Frontend

```bash
npm install
npx next dev -H 0.0.0.0
```

> O frontend será acessível em: `http://192.168.1.x:3000`

> O backend estará em: `http://192.168.1.x:4000`

---

## 📡 Comunicação com o ESP32

| Rota        | Método | Descrição                         | Exemplo de resposta                       |
| ----------- | ------ | --------------------------------- | ----------------------------------------- |
| `/ligar`    | GET    | Libera medicamento                |                                           |
| `/desligar` | GET    | Finaliza a liberação              |                                           |
| `/status`   | GET    | Retorna status atual do dispenser | `{ "estado": "ligado" }` ou `"desligado"` |

---

## 🧪 Como funciona

1. Ao acessar a interface, o sistema consulta `/status` do ESP e mostra o estado do botão.
2. Ao clicar, o comando é enviado ao backend, que repassa para o ESP.
3. Todos os dispositivos conectados via WebSocket são atualizados instantaneamente.

---

## 🧠 Objetivos do Projeto

* Promover **autonomia** para idosos que usam múltiplos medicamentos
* Reduzir falhas de horário de medicação
* Desenvolver uma solução de **baixo custo**, replicável por outras escolas
* Integrar estudantes a tecnologias de **IoT**, **prototipagem**, **design** e **programação**

---

## 📱 Acesso via celular

* Verifique o IP local do seu computador (`ipconfig`)
* Conecte o celular na mesma rede Wi-Fi
* Acesse pelo navegador:

  ```
  http://192.168.1.x:3000
  ```

---

## 📄 Licença

Este projeto é educativo e sem fins lucrativos, desenvolvido por estudantes da ETE Antônio Arruda de Farias, com apoio da FACEPE.

---

## 👤 Idealizadores

**Jose Everton Figueireo Gomes**
Professor de Desenvolvimento de Sistemas na ETE Antônio Arruda de Farias
[Lattes](http://lattes.cnpq.br/7930722187872652)

**Manoel Cabral Pires da Silva**
Professor de Desenvolvimento de Sistemas na ETE Antônio Arruda de Farias
[Lattes](https://lattes.cnpq.br/4075348078872955)

---

## ✨ Desenvolvido no âmbito do edital FACEPE - Espaços CRIA
