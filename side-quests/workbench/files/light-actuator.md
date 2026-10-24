# A light-triggered servo sketch

Code example · 2024-12-22

English translation of an Arduino sketch for a proposed light-sensing actuator. Retained as a new-device concept from a mixed session; the appliance diagnosis and repair steps are excluded. No physical build or solution to the later capacitive-touch requirement is established.

---

```cpp
#include <Servo.h>

Servo servo;
int sensorPin = A0;
int sensorValue = 0;
int threshold = 500;  // Adjust this value for the red light

void setup() {
  servo.attach(9);  // Servo motor pin
  servo.write(0);   // Initial position
  pinMode(sensorPin, INPUT);
}

void loop() {
  sensorValue = analogRead(sensorPin);
  if (sensorValue > threshold) {
    servo.write(90);  // Press the button
    delay(1000);      // Hold for 1 second
    servo.write(0);   // Return to the initial position
  }
  delay(100);
}
```
