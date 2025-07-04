#include "SoftwareSerial.h"

SoftwareSerial ESP_Serial(10, 11);  // RX, TX

String rede = "COMPUTADOR";
String senha = "demetrio";
String resposta = "";

const int rele = 13;
int estadoRele = 0;
String botao = "";

void setup() {
  pinMode(rele, OUTPUT);

  Serial.begin(9600);
  ESP_Serial.begin(9600);

  delay(1000);  //espera de seguranca

  Serial.println("Conectando a rede...");
  String CWJAP = "\"AT+CWJAP=\"";
  CWJAP += rede;
  CWJAP += "\",\"";
  CWJAP += senha;
  CWJAP += "\"";
  sendCommand(CWJAP);
  readResponse(10000);

  delay(2000);  //espera de seguranca

  if (resposta.indexOf("OK") == -1) {  //procura na resposta se houve OK
    Serial.println("Atencao: Nao foi possivel conectar a rede WiFi.");
    Serial.println("Verifique se o nome da rede e senha foram preenchidos corretamente no codigo e tente novamente.");
  } else {
    Serial.println("Obtendo endereco de IP na rede...");
    sendCommand("AT+CIFSR");
    readResponse(1000);

    Serial.println("Resposta do ESP:");
    Serial.println(resposta);

    Serial.println("Configurando para multiplas conexoes...");
    sendCommand("AT+CIPMUX=1");
    readResponse(1000);

    Serial.println("Ligando servidor...");
    sendCommand("AT+CIPSERVER=1,80");
    readResponse(1000);

    Serial.print("Pronto, acesse o IP atraves de um dispositivo ligado na mesma rede do ESP8266.");
  }
}

void loop() {
  if (ESP_Serial.available()) {
    if (ESP_Serial.find("+IPD,")) {
      delay(500);
      char id = ESP_Serial.peek();

      // Lê a requisição inteira como texto
      String request = "";
      while (ESP_Serial.available()) {
        char c = ESP_Serial.read();
        request += c;
      }

      // Mostra a requisição no Serial Monitor para depuração
      Serial.println("Requisicao recebida:");
      Serial.println(request);

      String respostaApi = "";

      if (request.indexOf("/ligar_1") != -1) {
        digitalWrite(rele, HIGH);
        estadoRele = 1;
        respostaApi = "ligado";
      } else if (request.indexOf("/desligar_1") != -1) {
        digitalWrite(rele, LOW);
        estadoRele = 0;
        respostaApi = "desligado";
      } else if (request.indexOf("/status") != -1) {
        respostaApi = (estadoRele == 1) ? "ligado" : "desligado";
      } else {
        respostaApi = "invalido";
      }

      // monta a resposta em JSON
      String json = String("{") +
                    "\"estado1\": \"" + respostaApi + "\"," +
                    "}";


      String response = String("HTTP/1.1 200 OK\r\n") + "Content-Type: application/json\r\n" + "Access-Control-Allow-Origin: *\r\n" + "Connection: close\r\n\r\n" + json;


      String cipSend = "AT+CIPSEND=";
      cipSend += (int(id) - 48);
      cipSend += ",";
      cipSend += response.length();

      sendCommand(cipSend);
      delay(100);  // pequena espera para garantir o ">" do AT+CIPSEND
      if (ESP_Serial.find(">")) {
        ESP_Serial.print(response);
        delay(100);  // tempo para enviar tudo
      } else {
        Serial.println("Erro ao iniciar envio com CIPSEND");
      }


      String closeCommand = "AT+CIPCLOSE=";
      closeCommand += (int(id) - 48);
      sendCommand(closeCommand);
      readResponse(500);
    }
  }
}



void sendCommand(String cmd) {
  ESP_Serial.println(cmd);
}

void readResponse(unsigned int timeout) {
  unsigned long timeIn = millis();  //momento que entramos nessa funcao é salvo
  resposta = "";
  while (timeIn + timeout > millis()) {
    if (ESP_Serial.available()) {
      char c = ESP_Serial.read();
      resposta += c;
    }
  }
  //Serial.println(resposta);
}