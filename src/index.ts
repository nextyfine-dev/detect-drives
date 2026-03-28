import { exec } from "node:child_process";
import { platform } from "node:os";

interface Child {
  alignment: number;
  "disc-aln": number;
  dax: boolean;
  "disc-gran": string;
  "disc-max": string;
  "disc-zero": boolean;
  fsavail: string | null;
  fsroots: (string | null)[];
  fssize: string | null;
  fstype: string | null;
  fsused: string | null;
  "fsuse%": string | null;
  fsver: string | null;
  group: string;
  hctl: string | null;
  hotplug: boolean;
  kname: string;
  label: string | null;
  "log-sec": number;
  "maj:min": string;
  "min-io": number;
  mode: string;
  model: string | null;
  name: string;
  "opt-io": number;
  owner: string;
  partflags: string | null;
  partlabel: string | null;
  parttype: string | null;
  parttypename: string | null;
  partuuid: string | null;
  path: string;
  "phy-sec": number;
  pkname: string | null;
  pttype: string | null;
  ptuuid: string | null;
  ra: number;
  rand: boolean;
  rev: string | null;
  rm: boolean;
  ro: boolean;
  rota: boolean;
  "rq-size": number;
  sched: string;
  serial: string | null;
  size: string;
  start: number | null;
  state: string | null;
  subsystems: string;
  mountpoint: string | null;
  mountpoints: (string | null)[];
  tran: string | null;
  type: string;
  uuid: string | null;
  vendor: string | null;
  wsame: string;
  wwn: string | null;
  zoned: string;
  "zone-sz": string;
  "zone-wgran": string;
  "zone-app": string;
  "zone-nr": number;
  "zone-omax": number;
  "zone-amax": number;
}

interface Drive {
  alignment: number;
  "disc-aln": number;
  dax: boolean;
  "disc-gran": string;
  "disc-max": string;
  "disc-zero": boolean;
  fsavail: string | null;
  fsroots: (string | null)[];
  fssize: string | null;
  fstype: string | null;
  fsused: string | null;
  "fsuse%": string | null;
  fsver: string | null;
  group: string;
  hctl: string | null;
  hotplug: boolean;
  kname: string;
  label: string | null;
  "log-sec": number;
  "maj:min": string;
  "min-io": number;
  mode: string;
  model: string | null;
  name: string;
  "opt-io": number;
  owner: string;
  partflags: string | null;
  partlabel: string | null;
  parttype: string | null;
  parttypename: string | null;
  partuuid: string | null;
  path: string;
  "phy-sec": number;
  pkname: string | null;
  pttype: string | null;
  ptuuid: string | null;
  ra: number;
  rand: boolean;
  rev: string | null;
  rm: boolean;
  ro: boolean;
  rota: boolean;
  "rq-size": number;
  sched: string;
  serial: string | null;
  size: string;
  start: number | null;
  state: string | null;
  subsystems: string;
  mountpoint: string | null;
  mountpoints: (string | null)[];
  tran: string | null;
  type: string;
  uuid: string | null;
  vendor: string | null;
  wsame: string;
  wwn: string | null;
  zoned: string;
  "zone-sz": string;
  "zone-wgran": string;
  "zone-app": string;
  "zone-nr": number;
  "zone-omax": number;
  "zone-amax": number;
  children: Child[];
}

export type PowershellDrive = {
  Caption: string;
  VolumeName: string;
  DriveType: string;
  Size: string;
  FileSystem: string;
  FreeSpace: string;
  Description: string;
};

type LsblkDevice = {
  name: string;
  kname: string;
  tran: string | null;
  size: string;
  mountpoint: string | null;
  fstype: string | null;
  label: string | null;
  model: string | null;
  vendor: string | null;
  children: LsblkDevice[];
};

type LsblkOutput = {
  blockdevices: LsblkDevice[];
};

export type LinuxDrive = {
  device: string;
  mountpoint: string | null;
  label: string | null;
  model: string | null;
  vendor: string | null;
  fileSystem: string | null;
  totalSizeBytes: number | null;
  usedBytes: number | null;
  availableBytes: number | null;
  usedPercentage: string | null;
  isUsb: boolean;
  driveType: string | null;
};

type MacPartition = {
  DeviceIdentifier: string;
  MountPoint?: string;
  VolumeName?: string;
};

type MacDisk = {
  DeviceIdentifier: string;
  Content?: string;
  Internal?: boolean;
  Partitions?: MacPartition[];
};

type DiskUtilPlist = {
  AllDisksAndPartitions: MacDisk[];
};

export type MacDrive = {
  device: string;
  mountpoint: string;
  label: string | null;
  totalSizeBytes: number | null;
  usedBytes: number | null;
  availableBytes: number | null;
  usedPercentage: string | null;
  fileSystem: string | null;
  isUsb: boolean;
  driveType: "USB" | "INTERNAL" | "UNKNOWN";
};

export type WindowsDrive = {
  path: string;
  driveType: string;
  fileSystem: string;
  availableSize: string;
  totalSize: string;
  name: string;
  isUsb: boolean;
};

const errMsg = `Unable to detect drives on your ${platform()} system!`;

/**
 * Executes a shell command and returns the output
 * @param command - The command to execute
 * @returns The output of the command
 */
const execCommand = async (command: string) => {
  return new Promise((resolve, reject) => {
    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(new Error(error?.message ?? stderr));
      } else {
        resolve(stdout);
      }
    });
  });
};

/**
 * Parses the output of the `df` command
 * @param dfRaw - The raw output of the `df` command
 * @returns A map of mount points to their disk usage information
 */
const parseDf = (dfRaw: string) => {
  // Split the raw output into lines and remove the header. Ex - Filesystem     1K-blocks    Used Available Use% Mounted on
  const lines = dfRaw.trim().split("\n").slice(1);

  // Create a map to store the disk usage information
  const dfMap = new Map<
    string,
    { total: number; used: number; available: number }
  >();

  // Iterate over each line and parse the disk usage information
  for (const line of lines) {
    // Split the line by whitespace
    const parts = line.trim().split(/\s+/);

    // Extract the size, used, available, and target parts
    const [, size, used, avail, ...targetParts] = parts;

    // Join the target parts to handle spaces in mount paths
    const target = targetParts.join(" ");

    // Add the disk usage information to the map
    dfMap.set(target, {
      total: Number(size),
      used: Number(used),
      available: Number(avail),
    });
  }

  return dfMap;
};

/**
 * Detects all drives on a Linux system
 * @returns An array of drive objects
 */
export const detectDrivesOnLinux = async () => {
  try {
    // Execute both commands in parallel
    const [lsblkRaw, dfRaw] = await Promise.all([
      execCommand(
        "lsblk -J -o NAME,KNAME,TRAN,SIZE,MOUNTPOINT,FSTYPE,LABEL,MODEL,VENDOR",
      ),
      execCommand("df -B1 --output=source,size,used,avail,target"),
    ]);

    const lsblk: LsblkOutput = JSON.parse(lsblkRaw as string);
    const dfMap = parseDf(dfRaw as string);

    const drives: LinuxDrive[] = [];

    for (const device of lsblk.blockdevices) {
      if (device.children) {
        for (const part of device.children) {
          if (!part.mountpoint) continue;

          const usage = dfMap.get(part.mountpoint);

          drives.push({
            device: part.name,
            mountpoint: part.mountpoint,
            label: part.label?.trim() || null,
            model: device.model?.trim() || null,
            vendor: device.vendor?.trim() || null,
            fileSystem: part.fstype,
            totalSizeBytes: usage?.total ?? null,
            usedBytes: usage?.used ?? null,
            availableBytes: usage?.available ?? null,
            usedPercentage: usage
              ? ((usage.used / usage.total) * 100).toFixed(2)
              : null,
            isUsb: device.tran === "usb",
            driveType: device.tran,
          });
        }
      }
    }

    return drives;
  } catch (error: any) {
    throw new Error(error.message || errMsg);
  }
};

const getMacFsType = async (device: string): Promise<string | null> => {
  try {
    const raw = await execCommand(`diskutil info -plist /dev/${device}`);

    const jsonRaw = await execCommand(
      `printf '%s' "${raw}" | plutil -convert json -o - -`,
    );

    const info = JSON.parse(jsonRaw as string);

    return (
      info.FilesystemType || // best
      info.Content || // fallback
      null
    );
  } catch {
    return null;
  }
};

export const detectDrivesOnMac = async (): Promise<MacDrive[]> => {
  try {
    const [plistRaw, dfRaw] = await Promise.all([
      execCommand("diskutil list -plist"),
      execCommand("df -k"),
    ]);

    // Convert plist → JSON using plutil
    const jsonRaw = await execCommand(
      `echo '${plistRaw}' | plutil -convert json -o - -`,
    );

    const diskInfo: DiskUtilPlist = JSON.parse(jsonRaw as string);
    const dfMap = parseDf(dfRaw as string);

    const drives: MacDrive[] = [];

    for (const disk of diskInfo.AllDisksAndPartitions) {
      const isUsb = disk.Internal === false;

      if (!disk.Partitions) continue;

      for (const part of disk.Partitions) {
        if (!part.MountPoint) continue;

        const usage = dfMap.get(part.MountPoint);
        const fsType = await getMacFsType(part.DeviceIdentifier);
        drives.push({
          device: part.DeviceIdentifier,
          mountpoint: part.MountPoint,
          label: part.VolumeName?.trim() || null,
          totalSizeBytes: usage?.total ?? null,
          usedBytes: usage?.used ?? null,
          availableBytes: usage?.available ?? null,
          fileSystem: fsType,
          usedPercentage: usage
            ? ((usage.used / usage.total) * 100).toFixed(2)
            : null,
          isUsb,
          driveType: isUsb ? "USB" : "INTERNAL",
        });
      }
    }

    return drives;
  } catch (error: any) {
    throw new Error(error.message || "Failed to detect Mac drives");
  }
};

const isWmicAvailable = async () => {
  try {
    await execCommand("where wmic");
    return true;
  } catch {
    return false;
  }
};

const getDrivesForNonWmic = async (details: string) => {
  const drives: PowershellDrive[] = [];
  let currentDrive: PowershellDrive = {} as PowershellDrive;

  // Split the raw details into lines and process each line
  details
    .trim()
    .split("\r\n")
    .forEach((line) => {
      if (line.startsWith("Caption")) {
        // If a new drive's caption is found, push the current drive to the array (if it exists)
        if (Object.keys(currentDrive).length > 0) {
          drives.push(currentDrive);
        }
        // Start a new currentDrive object with the caption
        currentDrive = {
          Caption: line.split(":")[1].trim(),
        } as PowershellDrive;
      } else {
        // Process other lines to extract key-value pairs
        const separatorIndex = line.indexOf(":");
        if (separatorIndex !== -1) {
          const key = line.slice(0, separatorIndex).trim();
          const value = line.slice(separatorIndex + 1).trim();
          (currentDrive as any)[key] = value; // Add the key-value pair to the current drive object
        }
      }
    });

  // Push the last processed drive to the array if it exists
  if (Object.keys(currentDrive).length > 0) {
    drives.push(currentDrive);
  }

  // Map the array to the final format for easier access to drive properties
  return drives.map((drive) => {
    const {
      Caption,
      VolumeName,
      DriveType,
      Size,
      FileSystem,
      FreeSpace,
      Description,
    } = drive;
    const newName = Description || VolumeName || "Local Disk"; // Default to 'Local Disk' if no description
    const isUsb = DriveType === "2"; // DriveType 2 indicates a removable USB drive

    return {
      path: Caption,
      driveType: DriveType,
      fileSystem: FileSystem,
      availableSize: FreeSpace,
      totalSize: Size,
      name: newName,
      isUsb,
    };
  });
};

/**
 * Detect drives on Windows using PowerShell and wmic
 * @returns Array of drives on Windows
 */
export const detectDrivesOnWindows = async (): Promise<WindowsDrive[]> => {
  try {
    // Check if 'wmic' is available to use for drive detection
    const wmicAvailable = await isWmicAvailable();

    if (!wmicAvailable) {
      // If 'wmic' is not available, use PowerShell to get drive details
      const details = await execCommand(
        "powershell -Command Get-WmiObject -Class Win32_LogicalDisk | Select-Object Caption, VolumeName, DriveType, Size, FileSystem, FreeSpace, Description",
      );
      return getDrivesForNonWmic(details as string); // Parse and return the drive details
    }

    const details = await execCommand(
      "wmic logicaldisk get Caption,VolumeName,DriveType,Size,FileSystem,FreeSpace,Description",
    );
    const wmicDetails = details as string;

    return wmicDetails
      .trim()
      .split("\r\n")
      .slice(1)
      .map((wmicDetails) => {
        const detailArray = wmicDetails.split(/\s+/).filter(Boolean);
        const filterKeywords = new Set(["Local", "Fixed", "Disk", "Removable"]);

        const filterDetail = detailArray.filter(
          (detail) => !filterKeywords.has(detail.trim()),
        );
        const description = detailArray.filter((detail) =>
          filterKeywords.has(detail.trim()),
        );

        const newName =
          description && description.length > 0
            ? description.join(" ")
            : "Local Disk";

        const [path, driveType, fileSystem, availableSize, totalSize, ...name] =
          filterDetail;
        return {
          path,
          driveType,
          fileSystem,
          availableSize,
          totalSize,
          name: name && name.length > 0 ? name.join(" ") : newName,
          isUsb: Number.parseInt(driveType) === 2,
        };
      });
  } catch (error: any) {
    throw new Error(error.message || errMsg);
  }
};

/**
 * @deprecated Use detectDrivesOnLinux instead
 * @returns
 */
export const detectAllLinuxDrives = async (): Promise<Drive[]> => {
  try {
    if (platform() === "win32" || platform() === "darwin")
      throw new Error(errMsg);

    const command = `lsblk -J -o ALIGNMENT,DISC-ALN,DAX,DISC-GRAN,DISC-MAX,DISC-ZERO,FSAVAIL,FSROOTS,FSSIZE,FSTYPE,FSUSED,FSUSE%,FSVER,GROUP,HCTL,HOTPLUG,KNAME,LABEL,LOG-SEC,MAJ:MIN,MIN-IO,MODE,MODEL,NAME,OPT-IO,OWNER,PARTFLAGS,PARTLABEL,PARTTYPE,PARTTYPENAME,PARTUUID,PATH,PHY-SEC,PKNAME,PTTYPE,PTUUID,RA,RAND,REV,RM,RO,ROTA,RQ-SIZE,SCHED,SERIAL,SIZE,START,STATE,SUBSYSTEMS,MOUNTPOINT,MOUNTPOINTS,TRAN,TYPE,UUID,VENDOR,WSAME,WWN,ZONED,ZONE-SZ,ZONE-WGRAN,ZONE-APP,ZONE-NR,ZONE-OMAX,ZONE-AMAX`;
    const detail = (await execCommand(command)) as string;
    return JSON.parse(detail).blockdevices as Drive[];
  } catch (error: any) {
    throw new Error(error.message || errMsg);
  }
};

export const detectDrives = async () => {
  if (platform() === "win32") {
    return detectDrivesOnWindows();
  } else if (platform() === "linux") {
    return detectDrivesOnLinux();
  } else if (platform() === "darwin") {
    return detectDrivesOnMac();
  } else {
    throw new Error(errMsg);
  }
};

export const detectUsbDrives = async () => {
  const drives = await detectDrives();
  return drives.filter((drive) => drive.isUsb);
};
