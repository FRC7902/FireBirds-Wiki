### Installing WPILib & FRC Game Tools
---
### Creating a New WPILib Project
---
### Drive Subsystem
#### Creating a Subsystem
#### Installing Vendor Dependencies
#### Creating Motor Objects
To start, our drive subsystem is going to control motors

Since class names like `SparkMax` and `DifferentialDrive` come from our REVLib dependency, we must import them. Normally, this would be done by importing them like so:
```java
import com.revrobotics.spark.SparkMax;
import edu.wpi.first.wpilibj.drive.DifferentialDrive;
```

Fortunately, VSCode can automatically generate the import statement for you.

```java
private final SparkMax m_leftLeaderMotor;
private final SparkMax m_rightLeaderMotor;
private final SparkMax m_leftFollowerMotor;
private final SparkMax m_rightFollowerMotor;
```
> *Note: these should be defined in the class scope*

The first argument is the motor controller's corresponding CAN ID number, which is programmed into the motor controllers themselves. The second...
```java
m_leftLeaderMotor = new SparkMax(1, MotorType.kBrushless);
m_rightLeaderMotor = new SparkMax(2, MotorType.kBrushless);
m_leftFollowerMotor = new SparkMax(3, MotorType.kBrushless);
m_rightFollowerMotor = new SparkMax(4, MotorType.kBrushless);
```

```java
SparkMaxConfig globalConfig = new SparkMaxConfig();
SparkMaxConfig leftLeaderMotorConfig = new SparkMaxConfig();
SparkMaxConfig rightLeaderMotorConfig = new SparkMaxConfig();
SparkMaxConfig leftFollowerMotorConfig = new SparkMaxConfig();
SparkMaxConfig rightFollowerMotorConfig = new SparkMaxConfig();
```

```java
globalConfig.smartCurrentLimit(50).idleMode(IdleMode.kBrake);
```

```java
leftLeaderMotorConfig.apply(globalConfig);
rightLeaderMotorConfig.apply(globalConfig);
leftFollowerMotorConfig.apply(globalConfig).follow(m_leftLeaderMotor);
rightFollowerMotorConfig.apply(globalConfig).follow(m_rightLeaderMotor);
```

```java
m_leftLeaderMotor.configure(leftLeaderMotorConfig, ResetMode.kResetSafeParameters, PersistMode.kPersistParameters);

m_rightLeaderMotor.configure(rightLeaderMotorConfig, ResetMode.kResetSafeParameters, PersistMode.kPersistParameters);

m_leftFollowerMotor.configure(leftFollowerMotorConfig, ResetMode.kResetSafeParameters, PersistMode.kPersistParameters);

m_rightFollowerMotor.configure(rightFollowerMotorConfig, ResetMode.kResetSafeParameters, PersistMode.kPersistParameters);
```
#### Applying Motor Configurations
#### Defining Constants

```java
m_leftLeaderMotor = new SparkMax(DriveConstants.kLeftLeaderMotorID, MotorType.kBrushless);
m_rightLeaderMotor = new SparkMax(DriveConstants.kRightLeaderMotorID, MotorType.kBrushless);
m_leftFollowerMotor = new SparkMax(DriveConstants.kLeftFollowerMotorID, MotorType.kBrushless);
m_rightFollowerMotor = new SparkMax(DriveConstants.kRightFollowerMotorID, MotorType.kBrushless);
```

```java
public static class DriveConstants {
	public static final int kCurrentLimit = 40;
	
    public static final int kLeftLeaderMotorID = 1;
    public static final int kLeftFollowerMotorID = 2;
    public static final int kRightLeaderMotorID = 3;
    public static final int kRightFollowerMotorID = 4;
}
```
### Creating a Differential Drive
```java
private final DifferentialDrive m_drive;
```

```java
m_drive = new DifferentialDrive(m_leftLeaderMotor, m_rightLeaderMotor);
```
#### Implementing Arcade Drive
```java
public void arcadeDrive(double forward, double rotation) {
    m_drive.arcadeDrive(forward, rotation);
}
```
---
### Arcade Drive Command

```java
private final DriveSubsystem m_driveSubsystem;
```

```java
public ArcadeDriveCommand(DriveSubsystem driveSubsystem) {
    this.m_driveSubsystem = driveSubsystem;
    addRequirements(this.m_driveSubsystem);
}
```
#### Binding the Controller

```java
this.m_driverController = driverController;
```

```java
public ArcadeDriveCommand(DriveSubsystem driveSubsystem, CommandXboxController driverController) {
    this.m_driveSubsystem = driveSubsystem;
    this.m_driverController = driverController;

    addRequirements(this.m_driveSubsystem);
}
```
#### Setting as Default Command
---
### Testing in Simulation
#### Cloning the Template Repository