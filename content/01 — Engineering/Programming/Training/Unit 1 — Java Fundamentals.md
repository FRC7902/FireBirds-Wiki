 [Online Java Compiler](https://www.w3schools.com/java/java_compiler.asp)
### Java Syntax
Read the following page on [Java Syntax](https://www.w3schools.com/java/java_syntax.asp).

Here is an FRC example code snippet:
```java
double maximumSpeed = 5.0;
```
### Java Output
Read the following page on [Java Output](https://www.w3schools.com/java/java_output.asp).

Here is an FRC example code snippet:
```java
System.out.println(maximumSpeed)
```
### Java Comments
Read the following page on [Java Comments](https://www.w3schools.com/java/java_comments.asp).

Here is an FRC example code snippet:
```java
/**
 * Maximum speed of the robot in meters per second, used to limit acceleration.
 */
double maximumSpeed = 5.0; // Linear Speed (ft/sec)
```
### Java Variables
Read the following page on [Java Variables](https://www.w3schools.com/java/java_variables.asp),

Here is an FRC example code snippet:
```java
double speed = -m_driverController.getLeftY();
```
### Java Data Types
Read the following page on [Java Data Types](https://www.w3schools.com/java/java_data_types.asp).
### Java Operators
Read the following page on [Java Operators](https://www.w3schools.com/java/java_operators.asp).

Here is an FRC example code snippet:
```java
double velocity = (((kNEOMaxRPM * m_leftMotor.get()) / kDrivetrainGearRatio) * Math.PI * kWheelDiameterInches) / 60;
```
### Java Strings
Read the following page on [Java Strings](https://www.w3schools.com/java/java_strings.asp).

Here is an FRC example code snippet:
```java
SmartDashboard.putNumber("Current speed", currSpeed);
```
### Java Math
Read the following page on [Java Math](https://www.w3schools.com/java/java_math.asp).

Here is an FRC example code snippet:
```java
double distance = Math.sqrt(x * x + y * y);
```

### Java Booleans
Read the following page on [Java Booleans](https://www.w3schools.com/java/java_booleans.asp).

Here is an FRC example code snippet:
```java
boolean isAtTarget = m_encoder.getPosition() >= targetPosition;
```

### Java If...Else
Read the following page on [Java Conditions](https://www.w3schools.com/java/java_conditions.asp).

Here is an FRC example code snippet:
```java
if (speed > maxSpeed) {
  speed = maxSpeed;
} else {
  speed = speed;
}
```

### Java Switch
Read the following page on [Java Switch](https://www.w3schools.com/java/java_switch.asp).

Here is an FRC example code snippet:
```java
switch (driverMode) {
  case 1:
    drive.arcadeDrive(xSpeed, zRotation);
    break;
  case 2:
    drive.tankDrive(leftSpeed, rightSpeed);
    break;
  default:
    drive.stopMotor();
}
```

### Java While Loop
Read the following page on [Java While Loop](https://www.w3schools.com/java/java_while_loop.asp).

Here is an FRC example code snippet:
```java
while (!gyro.isCalibrated()) {
  Timer.delay(0.1);
}
```

### Java For Loop
Read the following page on [Java For Loop](https://www.w3schools.com/java/java_for_loop.asp).

Here is an FRC example code snippet:
```java
for (int i = 0; i < motorArray.length; i++) {
  motorArray[i].set(0.0);
}
```

### Break / Continue
Read the following page on [Java Break/Continue](https://www.w3schools.com/java/java_break.asp).

Here is an FRC example code snippet:
```java
for (Motor motor : motors) {
  if (motor.isOverheated()) {
    break;
  }
  motor.runAtFullSpeed();
}
```

### Java Arrays
Read the following page on [Java Arrays](https://www.w3schools.com/java/java_arrays.asp).

Here is an FRC example code snippet:
```java
MotorController[] motors = { leftMotor, rightMotor };
```

---

### Java Methods
Read the following page on [Java Methods](https://www.w3schools.com/java/java_methods.asp).

Here is an FRC example code snippet:
```java
public void stopAllMotors() {
  leftMotor.stopMotor();
  rightMotor.stopMotor();
}
```

### Java Method Parameters
Read the following page on [Java Method Parameters](https://www.w3schools.com/java/java_methods_param.asp).

Here is an FRC example code snippet:
```java
public void setMotorSpeed(double speed) {
  motor.set(speed);
}
```

### Java Method Overloading
Read the following page on [Java Method Overloading](https://www.w3schools.com/java/java_method_overloading.asp).

Here is an FRC example code snippet:
```java
public void log(String message) {
  SmartDashboard.putString("Log", message);
}

public void log(String label, double value) {
  SmartDashboard.putNumber(label, value);
}
```

### Java Scope
Read the following page on [Java Scope](https://www.w3schools.com/java/java_scope.asp).

Here is an FRC example code snippet:
```java
public class Robot {
  private double speed = 0.5;

  public void teleopPeriodic() {
    double localSpeed = 1.0;
    drive.setSpeed(localSpeed); // localSpeed is in scope here
  }
}
```

---

### JavaObject-Oriented Programming (OOP)

### Classes / Objects
Read the following page on [Java Classes/Objects](https://www.w3schools.com/java/java_classes.asp).

Here is an FRC example code snippet:
```java
DriveSubsystem drive = new DriveSubsystem();
drive.arcadeDrive(forward, rotation);
```

### Java Attributes
Read the following page on [Java Class Attributes](https://www.w3schools.com/java/java_class_attributes.asp).

Here is an FRC example code snippet:
```java
public class DriveSubsystem {
  public double maxSpeed = 3.0;
}
```

---
### Java Methods
Read the following page on [Java Class Methods](https://www.w3schools.com/java/java_class_methods.asp).

Here is an FRC example code snippet:
```java
public class DriveSubsystem {
  public void stop() {
    leftMotor.stopMotor();
    rightMotor.stopMotor();
  }
}
```

### Java Constructors
Read the following page on [Java Constructors](https://www.w3schools.com/java/java_constructors.asp).

Here is an FRC example code snippet:
```java
public class DriveSubsystem {
  public DriveSubsystem() {
    leftMotor = new Spark(0);
    rightMotor = new Spark(1);
  }
}
```

### Java Modifiers
Read the following page on [Java Modifiers](https://www.w3schools.com/java/java_modifiers.asp).

Here is an FRC example code snippet:
```java
private double speed;
public void setSpeed(double s) {
  speed = s;
}
```

### Java Encapsulation
Read the following page on [Java Encapsulation](https://www.w3schools.com/java/java_encapsulation.asp).

Here is an FRC example code snippet:
```java
public class Shooter {
  private double speed;

  public void setSpeed(double s) {
    speed = s;
  }

  public double getSpeed() {
    return speed;
  }
}
```

### Java Packages / API
Read the following page on [Java Packages](https://www.w3schools.com/java/java_packages.asp).

Here is an FRC example code snippet:
```java
import edu.wpi.first.wpilibj.Talon;

public class Intake {
  private final Talon motor = new Talon(3);
}
```

### Java Inheritance
Read the following page on [Java Inheritance](https://www.w3schools.com/java/java_inheritance.asp).

Here is an FRC example code snippet:
```java
public class AutonomousDrive extends DriveSubsystem {
  public void driveForwardAuto() {
    setSpeed(0.6);
  }
}
```
### Java Method Overriding
Method overriding occurs when a subclass provides its own implementation of a method that is already defined in its superclass.

Here is an FRC example code snippet:
```java
public class BaseCommand extends Command {
  @Override
  public void initialize() {
    System.out.println("Base initialize");
  }
}

public class DriveCommand extends BaseCommand {
  @Override
  public void initialize() {
    System.out.println("DriveCommand initialize");
  }
}
```

In this example, `DriveCommand` overrides the `initialize()` method from `BaseCommand`, so when it runs, it prints its own version.

### Enums
Read the following page on [Java Enums](https://www.w3schools.com/java/java_enums.asp).

Here is an FRC example code snippet:
```java
public enum RobotMode {
  TELEOP,
  AUTONOMOUS,
  DISABLED
}
```

---

### ArrayList
Read the following page on [Java ArrayList](https://www.w3schools.com/java/java_arraylist.asp).

Here is an FRC example code snippet:
```java
ArrayList<Double> distances = new ArrayList<>();
distances.add(2.4);
```

### Lambda
Read the following page on [Java Lambda Expressions](https://www.w3schools.com/java/java_lambda.asp).

Here is an FRC example code snippet:
```java
buttonA.onTrue(new InstantCommand(() -> arm.extend(), arm));
```
