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

const errMsg = `Unable to detect drives on your ${platform()} system!`;

const execCommand = async (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(error || stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

const parseDfDetails = (dfDetails: string) => {
  return dfDetails
    .split("\n")
    .slice(1)
    .map((line) => {
      const [
        fileSystem,
        totalSize,
        usedSize,
        availableSize,
        usedSizeInPercentage,
        path,
      ] = line.split(/\s+/).filter(Boolean);
      return {
        fileSystem,
        totalSize,
        usedSize,
        availableSize,
        usedSizeInPercentage,
        path,
      };
    });
};

export const detectDrivesOnUnix = async () => {
  try {
    const [mountDetails, dfDetails] = (await Promise.all([
      execCommand("mount"),
      execCommand("df"),
    ])) as string[];

    const dfDetailsArray = parseDfDetails(dfDetails);

    const neMountDetails = mountDetails
      .split("\n")
      .map((line) => {
        const [fileSystem, , path, , type] = line.split(/\s+/).filter(Boolean);
        const dfDetail = dfDetailsArray.find(
          (df) => df.fileSystem === fileSystem && df.path === path
        );
        const mountArr = path ? path.split("/") : [];
        const name = mountArr[mountArr.length - 1];
        return {
          fileSystem,
          path,
          name: name || "Local Disk",
          type,
          isUsb: type === "fuseblk",
          ...dfDetail,
        };
      })
      .filter((detail) =>
        Object.values(detail).every((val) => val !== undefined)
      );

    return neMountDetails;
  } catch (error: any) {
    throw new Error(error.message || errMsg);
  }
};

export const detectDrivesOnWindows = async () => {
  try {
    const details = (await execCommand(
      "wmic logicaldisk get Caption,VolumeName,DriveType,Size,FileSystem,FreeSpace,Description"
    )) as string;
    return details
      .trim()
      .split("\r\n")
      .slice(1)
      .map((detail) => {
        const [
          path,
          ds1,
          ds2,
          ds3,
          driveType,
          fileSystem,
          availableSize,
          totalSize,
          ...name
        ] = detail.split(/s+/).filter(Boolean);
        return {
          path,
          description: `${ds1} ${ds2} ${ds3}`,
          driveType,
          fileSystem,
          availableSize,
          totalSize,
          name: name && name.length > 0 ? name.join(" ") : "Local Disk",
          isUsb: parseInt(driveType) === 2,
        };
      });
  } catch (error: any) {
    throw new Error(error.message || errMsg);
  }
};

export const detectAllLinuxDrives = async (): Promise<Drive[]> => {
  try {
    if (platform() === "win32" || platform() === "darwin")
      throw new Error(errMsg);

    const command = `lsblk -J -o ALIGNMENT,DISC-ALN,DAX,DISC-GRAN,DISC-MAX,DISC-ZERO,FSAVAIL,FSROOTS,FSSIZE,FSTYPE,FSUSED,FSUSE%,FSVER,GROUP,HCTL,HOTPLUG,KNAME,LABEL,LOG-SEC,MAJ:MIN,MIN-IO,MODE,MODEL,NAME,OPT-IO,OWNER,PARTFLAGS,PARTLABEL,PARTTYPE,PARTTYPENAME,PARTUUID,PATH,PHY-SEC,PKNAME,PTTYPE,PTUUID,RA,RAND,REV,RM,RO,ROTA,RQ-SIZE,SCHED,SERIAL,SIZE,START,STATE,SUBSYSTEMS,MOUNTPOINT,MOUNTPOINTS,TRAN,TYPE,UUID,VENDOR,WSAME,WWN,ZONED,ZONE-SZ,ZONE-WGRAN,ZONE-APP,ZONE-NR,ZONE-OMAX,ZONE-AMAX`;
    const detail = (await execCommand(command)) as string;
    return JSON.parse(detail).blockdevices;
  } catch (error: any) {
    throw new Error(error.message || errMsg);
  }
};

export const detectDrives = async () =>
  platform() === "win32" ? detectDrivesOnWindows() : detectDrivesOnUnix();

export const detectUsbDrives = async () => {
  const drives = await detectDrives();
  return drives.filter((drive) => drive.isUsb);
};
