import mongoose from "mongoose";
import os from "os";
import checkDiskSpace from "check-disk-space";
import initFirebaseAdmin from "../config/firebaseAdmin.js";
import config from "../config/config.js";

/** ---------------------------
 *  MongoDB State Mapper
 * ---------------------------- */
const mapMongoState = (state) => {
  switch (state) {
    case 0: return "disconnected";
    case 1: return "connected";
    case 2: return "connecting";
    case 3: return "disconnecting";
    default: return "unknown";
  }
};

/** ---------------------------
 *  Event Loop Lag Monitor
 * ---------------------------- */
const getEventLoopDelay = () => {
  const start = process.hrtime.bigint();
  return new Promise((resolve) => {
    setImmediate(() => {
      const end = process.hrtime.bigint();
      const delay = Number(end - start) / 1e6; // ms
      resolve(delay.toFixed(3));
    });
  });
};

/** ---------------------------
 *  Advanced Health Check
 * ---------------------------- */
export const healthCheck = async (req, res) => {
  const eventLoopDelay = await getEventLoopDelay();

  const checks = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",

    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),

      cpu: {
        cores: os.cpus().length,
        loadAvg1: os.loadavg()[0],
        loadAvg5: os.loadavg()[1],
        loadAvg15: os.loadavg()[2],
      },

      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        process: process.memoryUsage(),
      },

      eventLoop: {
        delay_ms: eventLoopDelay,
      },

      // Updated below (disk usage)
      disk: {}
    },

    services: {
      mongo: { status: "unknown" },
      firebase: { status: "unknown" },
      config: {
        status: "ok",
        hasServiceAccountFile: config.firebase.hasServiceAccountFile,
      },
    }
  };

  /** ---------------------------
   *  Disk Space Info
   * ---------------------------- */
  try {
    const disk = await checkDiskSpace(process.platform === "win32" ? "C:" : "/");
    checks.system.disk = {
      free: disk.free,
      size: disk.size,
      used: disk.size - disk.free,
      usedPercentage: Number(((disk.size - disk.free) / disk.size) * 100).toFixed(2)
    };
  } catch (err) {
    checks.system.disk = {
      status: "error",
      error: err.message
    };
  }

  /** ---------------------------
   *  MongoDB Check
   * ---------------------------- */
  try {
    const state = mongoose.connection.readyState;
    checks.services.mongo.state = mapMongoState(state);

    if (state === 1) {
      const pingStart = performance.now();
      const admin = mongoose.connection.db.admin();
      const pingResult = await admin.ping();
      const pingTime = performance.now() - pingStart;

      const buildInfo = await admin.serverInfo();

      checks.services.mongo.status = "ok";
      checks.services.mongo.ping = `${pingTime.toFixed(2)} ms`;
      checks.services.mongo.server = {
        version: buildInfo.version,
        gitVersion: buildInfo.gitVersion,
        sysInfo: buildInfo.sysInfo
      };
    } else {
      checks.services.mongo.status = "degraded";
    }
  } catch (err) {
    checks.services.mongo.status = "error";
    checks.services.mongo.error = err.message;
  }

  /** ---------------------------
   *  Firebase Admin Check
   * ---------------------------- */
  try {
    const admin = initFirebaseAdmin();
    if (admin) {
      // Example: verifying admin SDK initialized properly
      const projectId = admin?.app()?.options?.credential?.projectId;

      checks.services.firebase.status = "ok";
      checks.services.firebase.projectId = projectId || "unknown";

      // Optional: Verify a token (if you want deep Firebase health)
      // await admin.auth().verifyIdToken("fake-token").catch(() => {});
    } else {
      checks.services.firebase.status = "degraded";
      checks.services.firebase.error = "Admin SDK returned null instance";
    }
  } catch (err) {
    checks.services.firebase.status = "error";
    checks.services.firebase.error = err.message;
  }

  /** ---------------------------
   *  Overall System Health Logic
   * ---------------------------- */
  const anyError = Object.values(checks.services).some(
    (svc) => svc.status === "error"
  );
  const anyDegraded = Object.values(checks.services).some(
    (svc) => svc.status === "degraded"
  );

  const overallStatus = anyError
    ? "error"
    : anyDegraded
    ? "degraded"
    : "ok";

  return res
    .status(overallStatus === "ok" ? 200 : 503)
    .json({ status: overallStatus, ...checks });
};

export default {
  healthCheck,
};
