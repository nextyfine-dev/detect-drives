# 🔍 detect-drives

detect-drives: Cross-platform Node.js library for detecting drives and retrieving disk information

🚀 A versatile Node.js library for effortless drive detection and detailed disk information retrieval. Seamlessly discover drives on Windows, macOS, and Linux systems, empowering your applications with comprehensive storage insights.

## Table of Contents

- [🔍 detect-drives](#-detect-drives)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Initialization](#initialization)
    - [Detecting All Drives](#detecting-all-drives)
    - [Detecting USB Drives](#detecting-usb-drives)
    - [Platform-Specific Detection](#platform-specific-detection)
    - [Advanced Usage Examples](#advanced-usage-examples)
      - [Filtering Drives by Type](#filtering-drives-by-type)
      - [Drive Information Processing](#drive-information-processing)
      - [Error Handling](#error-handling)
  - [API Reference](#api-reference)
    - [Functions](#functions)
      - [`detectDrives()`](#detectdrives)
      - [`detectUsbDrives()`](#detectusbdrives)
      - [`detectDrivesOnLinux()`](#detectdrivesonlinux)
      - [`detectDrivesOnMac()`](#detectdrivesonmac)
      - [`detectDrivesOnWindows()`](#detectdrivesonwindows)
      - [`detectAllLinuxDrives()` ⚠️ Deprecated](#detectalllinuxdrives-️-deprecated)
    - [Type Definitions](#type-definitions)
      - [WindowsDrive](#windowsdrive)
      - [MacDrive](#macdrive)
      - [LinuxDrive](#linuxdrive)
  - [Recent Changes](#recent-changes)
    - [Version 1.3.0](#version-130)
      - [🚀 New Features](#-new-features)
      - [🔧 Improvements](#-improvements)
      - [📊 Data Accuracy](#-data-accuracy)
      - [🏗️ Technical Changes](#️-technical-changes)
      - [🔄 Deprecations](#-deprecations)
  - [Development](#development)
    - [Building the Project](#building-the-project)
    - [Project Structure](#project-structure)
  - [License](#license)

## Features

- 🖥️ Detect drives on Windows, macOS, and Linux systems effortlessly.
- 📄 Retrieve detailed disk information including file system, size, usage, and more.
- 🔌 Detect USB drives with ease.
- 🌐 Cross-platform compatibility ensures seamless integration across diverse environments.
- 🛠️ Versatile API for flexible usage in various Node.js applications.
- 💻 Lightweight and dependency-free, keeping your projects efficient and agile.
- 🔄 Asynchronous and synchronous programming paradigms supported for enhanced flexibility.
- 📦 Easy installation via npm or yarn for quick setup.

detect-drives provides a comprehensive solution for drive detection and disk information retrieval, ensuring smooth operation and deep insights into storage systems.

## Installation

Install the package using npm:

```bash
npm install detect-drives
```

Install the package using yarn:

```bash
yarn add detect-drives
```

## Usage

### Initialization

```javascript
// CommonJS
const { detectDrives, detectUsbDrives } = require("detect-drives");

// ESM
import { detectDrives, detectUsbDrives } from "detect-drives";
```

### Detecting All Drives

```javascript
const drives = await detectDrives();
console.log("Detected Drives:", drives);
```

### Detecting USB Drives

```javascript
const usbDrives = await detectUsbDrives();
console.log("Detected USB Drives:", usbDrives);
```

### Platform-Specific Detection

```javascript
// Linux-specific drive detection
const linuxDrives = await detectDrivesOnLinux();
console.log("Linux Drives:", linuxDrives);

// macOS-specific drive detection
const macDrives = await detectDrivesOnMac();
console.log("macOS Drives:", macDrives);

// Windows-specific drive detection
const windowsDrives = await detectDrivesOnWindows();
console.log("Windows Drives:", windowsDrives);
```

### Advanced Usage Examples

#### Filtering Drives by Type

```javascript
// Get only USB drives
const allDrives = await detectDrives();
const usbDrives = allDrives.filter((drive) => drive.isUsb);

// Get only internal drives
const internalDrives = allDrives.filter((drive) => !drive.isUsb);
```

#### Drive Information Processing

```javascript
const drives = await detectDrives();

drives.forEach((drive) => {
  console.log(`Drive: ${drive.device || drive.path}`);
  console.log(`Mount Point: ${drive.mountpoint}`);
  console.log(`File System: ${drive.fileSystem}`);
  console.log(`Total Size: ${drive.totalSizeBytes || drive.totalSize} bytes`);
  console.log(`Used Space: ${drive.usedBytes || drive.usedSize} bytes`);
  console.log(
    `Available Space: ${drive.availableBytes || drive.availableSize} bytes`,
  );
  console.log(`Usage Percentage: ${drive.usedPercentage}%`);
  console.log(`Is USB: ${drive.isUsb}`);
  console.log(`Drive Type: ${drive.driveType}`);
  console.log("---");
});
```

#### Error Handling

```javascript
try {
  const drives = await detectDrives();
  console.log(`Found ${drives.length} drives`);
} catch (error) {
  console.error("Failed to detect drives:", error.message);
}
```

## API Reference

### Functions

#### `detectDrives()`

Detects all drives on the current platform (Windows, macOS, or Linux).

**Returns:** `Promise<WindowsDrive[] | MacDrive[] | LinuxDrive[]>`

#### `detectUsbDrives()`

Detects only USB drives across all platforms.

**Returns:** `Promise<WindowsDrive[] | MacDrive[] | LinuxDrive[]>`

#### `detectDrivesOnLinux()`

Detects drives specifically on Linux systems using `lsblk` and `df` commands.

**Returns:** `Promise<LinuxDrive[]>`

#### `detectDrivesOnMac()`

Detects drives specifically on macOS systems using `diskutil` and `df` commands.

**Returns:** `Promise<MacDrive[]>`

#### `detectDrivesOnWindows()`

Detects drives specifically on Windows systems using PowerShell and WMIC.

**Returns:** `Promise<WindowsDrive[]>`

#### `detectAllLinuxDrives()` ⚠️ Deprecated

Legacy function for Linux drive detection. Use `detectDrivesOnLinux()` instead.

**Returns:** `Promise<Drive[]>`

### Type Definitions

#### WindowsDrive

```typescript
interface WindowsDrive {
  path: string; // Drive letter (e.g., "C:")
  driveType: string; // Drive type number
  fileSystem: string; // File system type (e.g., "NTFS")
  availableSize: string; // Available space in bytes
  totalSize: string; // Total size in bytes
  name: string; // Drive name/label
  isUsb: boolean; // True if USB drive
}
```

#### MacDrive

```typescript
interface MacDrive {
  device: string; // Device identifier (e.g., "disk1s1")
  mountpoint: string; // Mount point path
  label: string | null; // Volume label
  totalSizeBytes: number | null; // Total size in bytes
  usedBytes: number | null; // Used space in bytes
  availableBytes: number | null; // Available space in bytes
  usedPercentage: string | null; // Usage percentage
  fileSystem: string | null; // File system type
  isUsb: boolean; // True if USB drive
  driveType: "USB" | "INTERNAL" | "UNKNOWN";
}
```

#### LinuxDrive

```typescript
interface LinuxDrive {
  device: string; // Device name (e.g., "sda1")
  mountpoint: string | null; // Mount point path
  label: string | null; // Volume label
  model: string | null; // Device model
  vendor: string | null; // Device vendor
  fileSystem: string | null; // File system type
  totalSizeBytes: number | null; // Total size in bytes
  usedBytes: number | null; // Used space in bytes
  availableBytes: number | null; // Available space in bytes
  usedPercentage: string | null; // Usage percentage
  isUsb: boolean; // True if USB drive
  driveType: string | null; // Drive transport type
}
```

## Recent Changes

### Version 1.3.0

#### 🚀 New Features

- **Enhanced Linux Drive Detection**: Completely rewritten Linux detection using `lsblk` and `df` commands for more accurate and detailed information
- **Improved macOS Support**: Better macOS drive detection with enhanced filesystem type detection using `diskutil`
- **Windows Compatibility**: Added fallback for systems without WMIC, using PowerShell as alternative
- **Better USB Detection**: More reliable USB drive identification across all platforms

#### 🔧 Improvements

- **Parallel Command Execution**: Linux and macOS detection now runs commands in parallel for better performance
- **Enhanced Error Handling**: More robust error messages and fallback mechanisms
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Cross-Platform Consistency**: Standardized drive information structure across platforms

#### 📊 Data Accuracy

- **Precise Size Information**: All size values now consistently returned in bytes
- **Usage Calculations**: Automatic calculation of used percentage and space usage
- **Mount Point Detection**: Improved detection of mounted and unmounted drives
- **File System Detection**: Enhanced filesystem type identification

#### 🏗️ Technical Changes

- **Modular Architecture**: Separated platform-specific implementations for better maintainability
- **Async/Await Support**: Full async/await support throughout the codebase
- **Dependency-Free**: No external dependencies, uses only native Node.js modules
- **Build System**: TypeScript compilation with optimized output for production use

#### 🔄 Deprecations

- `detectAllLinuxDrives()` is now deprecated in favor of `detectDrivesOnLinux()`
- Old Linux detection method using extensive `lsblk` flags replaced with more efficient approach

## Development

### Building the Project

```bash
# Install dependencies
npm install

# Build the TypeScript source
npm run build
```

### Project Structure

```
detect-drives/
├── src/
│   └── index.ts          # TypeScript source code
├── source/
│   ├── index.js          # Compiled JavaScript
│   └── index.d.ts        # TypeScript declarations
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## License

This package is licensed under the [MIT License](https://github.com/nextyfine-dev/detect-drives/blob/master/LICENSE). See the [LICENSE](./LICENSE) file for more information.
