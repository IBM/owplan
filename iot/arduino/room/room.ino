#include <SPI.h>
#include <WiFi101.h>
#include <DHT.h>

char ssid[] = "";               // Your network SSID (name) 
char pass[] = "";               // Your network password
int status = WL_IDLE_STATUS;    // The Wifi radio's status

unsigned long lastConnectionTime = 0;               // Last time you connected to the server, in milliseconds
boolean lastConnected = false;                      // State of the connection last time through the main loop
const unsigned long postingInterval = 10L * 1000;   // Delay between updates, in milliseconds

#define DHTTYPE DHT22   
#define DHTPIN 2                                    // What digital pin we're connected to

// Initialize the library instance:
WiFiClient client;

// Initialize the temp/humidity sensor
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  // Start serial port:
  Serial.begin(9600);
  
  // Give the Wifi and sensors time to boot up:
  delay(1000);

  // Attempt to connect using WPA2 encryption:
  Serial.println("Attempting to connect to WPA network...");
  status = WiFi.begin(ssid, pass);

  // If not connected to the network, stop here:
  if (status != WL_CONNECTED) { 
    Serial.println("Couldn't get a WiFi connection");
    while(true);
  } else {
    Serial.println("Connected to network");
  }

  // Start the thermometer/hygrometer
  dht.begin();
}

void loop() {
  
  // If there's incoming data from the net connection.
  // send it out the serial port.  This is for debugging
  // purposes only:
  if (client.available()) {
    char c = client.read();
    Serial.print(c);
  }

  // If there's no net connection, but there was one last time
  // through the loop, then stop the client:
  if (!client.connected() && lastConnected) {
    Serial.println("Disconnecting.");
    client.stop();
  }

  // If you're not connected, and ten seconds have passed since
  // your last connection, then connect again and send data:
  if (!client.connected() && (millis() - lastConnectionTime > postingInterval)) {

    // Reading temperature or humidity takes about 250 milliseconds!
    // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
    int humidity = dht.readHumidity();
    // Read temperature as Fahrenheit (isFahrenheit = true)
    int temperature = dht.readTemperature(true);
  
    // Check if any reads failed and exit early (to try again).
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }
    
    // Compute heat index in Fahreheit = false
    int heatindex = dht.computeHeatIndex(temperature, humidity);

    // Fixed data
    String location = "Ballroom+A";
    int capacity = 150;

    // Sensor data
    int decibels = 68;   

    Serial.println(location);
    Serial.println(capacity);
    Serial.println(temperature);
    Serial.println(humidity);
    Serial.println(heatindex);
    Serial.println(decibels);
    postReading(location, capacity, temperature, humidity, heatindex, decibels);

  }
  
  // Store the state of the connection for next time through
  // the loop:
  lastConnected = client.connected();
}

// This method makes a HTTP connection to the server. We don't use the Cloudant API or OpenWhisk API directly, because of SSL.
void postReading(String location, int capacity, int temperature, int humidity, int heatindex, int decibels) {
  Serial.println("Connecting...");
  if (client.connect("myowplan.mybluemix.net", 80)) { 
    Serial.println("Connected...");
    
    String postBody = "loc=" + location + "&cap=" + capacity  + "&tmp=" + temperature + "&hmd=" + humidity + "&hin=" + heatindex + "&dec=" + decibels;
    client.println("POST /room.php HTTP/1.1");

    // POST headers
    client.println("Host: myowplan.mybluemix.net");
    client.println("User-Agent: Arduino-Ethernet");
    client.println("Content-Type: application/x-www-form-urlencoded");
    client.println("Connection: close");
    client.print("Content-Length: ");
    client.println(postBody.length());
    client.println();
    
    // POST body
    client.println(postBody);

    Serial.println("Done...");

    // Note the time that the connection was made:
    lastConnectionTime = millis();
  } else {
    // If you couldn't make a connection:
    Serial.println("Connection failed.");
    Serial.println("Disconnecting.");
    client.stop();
  }
}
