# A light-triggered servo sketch

Code example · 2024-12-22

English translation of the Portuguese source. Original Arduino demonstration. It does not establish a built actuator or solve the later capacitive-touch requirement.

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
