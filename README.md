# 🔍 detect-drives

detect-drives: Cross-platform Node.js library for detecting drives and retrieving disk information

🚀 A versatile Node.js library for effortless drive detection and detailed disk information retrieval. Seamlessly discover drives on Windows, macOS, and Linux systems, empowering your applications with comprehensive storage insights.

## Table of Contents

- [🔍 detect-drives](#detect-drives)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Initialization](#initialization)
    - [Detecting Drives](#detecting-drives)
    - [Detecting USB Drives](#detecting-usb-drives)
    - [Functions](#functions)
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

### Detecting Drives

```javascript
const drives = await detectDrives();
console.log("Detected Drives:", drives);
```

### Detecting USB Drives

```javascript
const usbDrives = await detectUsbDrives();
console.log("Detected USB Drives:", usbDrives);
```

### Functions

- `detectDrives()`
- `detectUsbDrives()`
- `detectAllLinuxDrives()`
- `detectDrivesOnWindows()`
- `detectDrivesOnUnix()`

## License
