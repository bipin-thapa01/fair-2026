#include<WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <HX711.h>
#include <DHT.h>

// HX711
#define HX_DT 18
#define HX_SCK  19

// DHT11
#define DHTPIN   4
#define DHTTYPE  DHT11


Adafruit_MPU6050 mpu;
HX711 scale;
DHT dht(DHTPIN, DHTTYPE);


// strain gauge
float strain_microstrain, x_acc, y_acc, z_acc;

// accelerometer
float vibration_ms2;

// temp sensor
float temperature_C;
float humidity_percent;

//for scaling weight
float zeroReading = -136426;

const char* ssid = "wifi_not_available";
const char* pass = "bit123987";
const char* api = "http://10.10.0.107:8080/api/bridgeHealth/ingest";

void setup(){
  Serial.begin(115200);
  delay(2000);
  // Wire.begin();

  //checking if accelerometer is working or not
  if(!mpu.begin()){
    Serial.println("MPU6050 not found!");
    while (1);
  }
  else{
    Serial.println("MPU6050 working");
  }

  // for strain gauge
  scale.begin(HX_DT, HX_SCK);
  // scale.set_scale(2280.0);
  scale.tare();

  //for temp sensor
  Serial.println("Starting DHT11..");
  dht.begin();

  Serial.print("Connecting to:");
  Serial.println(ssid);
  WiFi.begin(ssid,pass);
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi Connected, IP Address:");
  Serial.print(WiFi.localIP());
}

void loop(){
  delay(2000);

  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  x_acc = a.acceleration.x;
  y_acc = a.acceleration.y;
  z_acc = a.acceleration.z;

  vibration_ms2 = sqrt(
    x_acc*x_acc + y_acc*y_acc + z_acc*z_acc
  );

  // Serial.print("Vibration: ");
  // Serial.println(vibration_ms2);

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature() - 10;

  if(isnan(humidity) || isnan(temperature)){
    Serial.println("Failed to read data from DHT11!");
    return;
  }

  // Serial.print("Temperature: ");
  // Serial.print(temperature);
  // Serial.print(" °C | Humidity: ");
  // Serial.print(humidity);
  // Serial.println(" %");

  if(scale.is_ready()){
    long rawValue = scale.read();     
    Serial.println(rawValue);       
  } else {
    Serial.println("HX711 not found.");
  }

  // if(WiFi.status() == WL_CONNECTED){
  //   HTTPClient http;
  //   http.begin(api);
  //   http.addHeader("Content-Type","application/json");
  //   String jsonData = "{";
  //   jsonData += "\"bridgeId\": BRIDGE-001 ,";
  //   jsonData += "\"vibration\":" + String(vibration_ms2, 2) + ",";
  //   jsonData += "\"temperature\":" + String(temperature, 2) + ",";
  //   jsonData += "\"humidity\":" + String(humidity, 2);
  //   jsonData += "}";

  //   int resCode = http.POST(jsonData);

  //   Serial.print("HTTP Response code: ");
  //   Serial.println(resCode);

  //   http.end();
  // }
}
