#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <time.h> // NTP

// DISPLAY OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET 16
#define SCREEN_ADDRESS 0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Wi-Fi
const char* ssid = "COMPUTADOR";
const char* password = "demetrio";

// WebServer
WebServer server(80);

// LEDs
#define NUM_LEDS 10
const int ledPins[NUM_LEDS] = { 2, 12, 13, 17, 21, 22, 23, 25, 34, 35 };
bool ledStatus[NUM_LEDS] = { false };

// Controle de mensagem temporária
String mensagemTemporaria = "";
unsigned long tempoMensagem = 0;
bool mostrandoMensagem = false;

// ========== Funções ==========

// Exibe mensagem temporária (ex: LED 3 ON)
void atualizarDisplayMsgTemporaria(const String& mensagem) {
  mensagemTemporaria = mensagem;
  tempoMensagem = millis();
  mostrandoMensagem = true;

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.setTextColor(SSD1306_WHITE);
  display.print("IP: ");
  display.println(WiFi.localIP());

  display.setTextSize(2);
  display.setCursor(0, 20);
  display.println(mensagem);
  display.display();
}

// Exibe a hora atual
void mostrarRelogio() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return;

  char horaFormatada[9]; // HH:MM:SS
  strftime(horaFormatada, sizeof(horaFormatada), "%H:%M:%S", &timeinfo);

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("IP: ");
  display.println(WiFi.localIP());

  display.setTextSize(2);
  display.setCursor(0, 20);
  display.println(horaFormatada);
  display.display();
}

// ========== Setup ==========

void setup() {
  Serial.begin(115200);

  pinMode(15, INPUT); // evitar conflito com I2C
  Wire.begin(4, 15);  // SDA = 4, SCL = 15
  delay(500);

  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("Erro no display OLED"));
    while (true);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("Conectando WiFi..."));
  display.display();
  delay(1000);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // Configurar NTP
  configTime(-3 * 3600, 0, "pool.ntp.org", "time.nist.gov"); // UTC-3

  // Inicializa LEDs
  for (int i = 0; i < NUM_LEDS; i++) {
    pinMode(ledPins[i], OUTPUT);
    digitalWrite(ledPins[i], LOW);
  }

  // Rota: ligar LED
  server.on("/ligar", HTTP_GET, []() {
    int led = server.arg("id").toInt();
    if (led >= 1 && led <= 10) {
      digitalWrite(ledPins[led - 1], HIGH);
      ledStatus[led - 1] = true;
      String msg = "LED " + String(led) + " ON";
      atualizarDisplayMsgTemporaria(msg);
      server.send(200, "text/plain", msg);
    } else {
      server.send(400, "text/plain", "ID inválido (1-10)");
    }
  });

  // Rota: desligar LED
  server.on("/desligar", HTTP_GET, []() {
    int led = server.arg("id").toInt();
    if (led >= 1 && led <= 10) {
      digitalWrite(ledPins[led - 1], LOW);
      ledStatus[led - 1] = false;
      String msg = "LED " + String(led) + " OFF";
      atualizarDisplayMsgTemporaria(msg);
      server.send(200, "text/plain", msg);
    } else {
      server.send(400, "text/plain", "ID inválido (1-10)");
    }
  });

  // Rota: status em JSON
  server.on("/status", HTTP_GET, []() {
    String json = "{";
    for (int i = 0; i < NUM_LEDS; i++) {
      json += "\"led_" + String(i + 1) + "\": \"" + (ledStatus[i] ? "on" : "off") + "\"";
      if (i < NUM_LEDS - 1) json += ", ";
    }
    json += "}";
    server.send(200, "application/json", json);
  });

  server.begin();
  Serial.println(F("Servidor iniciado"));
  atualizarDisplayMsgTemporaria("Pronto!");
  Serial.println(WiFi.localIP());
}

// ========== Loop ==========

void loop() {
  server.handleClient();

  unsigned long agora = millis();

  if (mostrandoMensagem) {
    if (agora - tempoMensagem >= 5000) {
      mostrandoMensagem = false;
      mostrarRelogio();
    }
  } else {
    static unsigned long ultimaAtualizacao = 0;
    if (agora - ultimaAtualizacao >= 1000) {
      ultimaAtualizacao = agora;
      mostrarRelogio();
    }
  }
}
