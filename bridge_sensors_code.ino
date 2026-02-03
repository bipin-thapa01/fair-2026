#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <HX711.h>
#include <DHT.h>

// HX711
#define HX_DT 18
#define HX_SCK 19

// DHT11
#define DHTPIN 4
#define DHTTYPE DHT11

Adafruit_MPU6050 mpu;
HX711 scale;
DHT dht(DHTPIN, DHTTYPE);

// Strain gauge
float strain_microstrain, x_acc, y_acc, z_acc;

// Accelerometer
float vibration_ms2;

// Temp sensor
float temperature_C;
float humidity_percent;

const char* ssid = "wifi_not_available";
const char* pass = "bit123987";
const char* api = "http://172.20.10.2:8080/api/bridgeHealth/ingest";

// Constants
long ADC_ZERO = -136900;
const float STRAIN_PER_ADC = 0.000231;
const float GRAMS_PER_ADC = 0.1757;

// Strain
float strainMicrostrain;

void setup() {
  Serial.begin(115200);
  delay(2000);

  // Checking if accelerometer is working or not
  if(!mpu.begin()) {
    Serial.println("MPU6050 not found!");
    while (1);
  } else {
    Serial.println("MPU6050 working");
  }

  // For strain gauge
  scale.begin(HX_DT, HX_SCK);
  delay(3000);
  ADC_ZERO = scale.read();
  Serial.print("ADC ZERO: ");
  Serial.println(ADC_ZERO);

  // For temp sensor
  Serial.println("Starting DHT11..");
  dht.begin();

  Serial.print("Connecting to: ");
  Serial.println(ssid);
  WiFi.begin(ssid, pass);
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected, IP Address:");
  Serial.println(WiFi.localIP());
}

void loop() {
  delay(30000);

  // Read accelerometer
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  x_acc = a.acceleration.x;
  y_acc = a.acceleration.y;
  z_acc = a.acceleration.z;

  vibration_ms2 = sqrt(x_acc*x_acc + y_acc*y_acc + z_acc*z_acc);

  // Read DHT11
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature() - 10;

  if(isnan(humidity) || isnan(temperature)){
    Serial.println("Failed to read data from DHT11!");
    return;
  }

  // Read HX711
  if(scale.is_ready()){
    long sum_adc = 0;
    const int samples = 20;
    for(int i = 0; i < samples; i++){
      sum_adc += scale.read();
      delay(50);
    }
    long adc_avg = sum_adc / samples;
    long adc_net = adc_avg - ADC_ZERO;

  // Convert to microstrain (µε) and weight (gm)
    strainMicrostrain = adc_net * STRAIN_PER_ADC;
    // float weight = adc_net * GRAMS_PER_ADC;
    Serial.print("Strain (µε): ");
    Serial.println(strainMicrostrain);

    float normalizedStrain = strainMicrostrain/15;

  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(api);
    http.addHeader("Content-Type","application/json");

    String jsonData = "{";
    jsonData += "\"bridgeId\": \"BRIDGE-001\",";
    jsonData += "\"vibration\": " + String(vibration_ms2, 2) + ",";
    jsonData += "\"temperature\": " + String(temperature, 2) + ",";
    jsonData += "\"humidity\": " + String(humidity, 2) + ",";
    jsonData += "\"Strain_microstrain\": " + String(normalizedStrain, 2);
    jsonData += "}";

    int resCode = http.POST(jsonData);
    Serial.println(jsonData);
    Serial.println(resCode);

    http.end();
  }

  } else {
    Serial.println("HX711 not found.");
  }

  Serial.println(strainMicrostrain);

}
